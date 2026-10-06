"use server";

import { redirect } from "next/navigation";
import { writeAudit } from "@/server/audit";
import { actorFor, getRequestMeta, requireUser, setSessionCookie } from "@/server/auth/current";
import { createSession, deleteSessionById, deleteUserSessions } from "@/server/auth/sessions";
import { getDb } from "@/server/db/client";
import { UserError, changeOwnPassword } from "@/server/users";

export interface ProfileState {
  error?: string;
}

async function guard<T>(run: () => Promise<T>): Promise<T | ProfileState> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof UserError) return { error: error.message };
    throw error;
  }
}

export async function changePasswordAction(_prev: ProfileState, fd: FormData): Promise<ProfileState> {
  const { user } = await requireUser();
  const next = String(fd.get("next") ?? "");
  if (next !== String(fd.get("confirm") ?? "")) return { error: "Nove lozinke se ne podudaraju." };
  const db = getDb();
  const actor = await actorFor(user);
  const result = await guard(() => changeOwnPassword(db, user, String(fd.get("current") ?? ""), next, actor));
  if (result && typeof result === "object" && "error" in result) return result;
  // Every session was invalidated — give this browser a fresh one.
  const fresh = await createSession(db, user.id, await getRequestMeta());
  await setSessionCookie(fresh.token, fresh.expiresAt);
  redirect("/profil?ok=password");
}

export async function revokeSessionAction(sessionId: string) {
  const { user, session } = await requireUser();
  if (sessionId !== session.id) await deleteSessionById(getDb(), user.id, sessionId);
  redirect("/profil?ok=sessions");
}

export async function revokeOtherSessionsAction() {
  const { user, session } = await requireUser();
  const db = getDb();
  await deleteUserSessions(db, user.id, session.id);
  await writeAudit(db, await actorFor(user), { action: "sessions_revoke", entityType: "user", entityId: user.id, summary: "Odjava sa svih ostalih uređaja" });
  redirect("/profil?ok=sessions");
}
