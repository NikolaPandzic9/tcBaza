"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { writeAudit } from "@/server/audit";
import {
  clearSessionCookie,
  getRequestMeta,
  getSessionToken,
  setSessionCookie,
} from "@/server/auth/current";
import { checkLoginGate, pruneLoginAttempts, recordLoginAttempt } from "@/server/auth/loginGuard";
import { burnPasswordCheck, verifyPassword } from "@/server/auth/password";
import { createSession, deleteSession, validateSessionToken } from "@/server/auth/sessions";
import { getDb, hasDatabase } from "@/server/db/client";
import { users } from "@/server/db/schema";

export interface LoginState {
  error?: string;
}

const GENERIC_ERROR = "Pogrešno korisničko ime ili lozinka.";

/** Only same-site relative paths — never an open redirect. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!hasDatabase) return { error: "Baza podataka nije podešena (DATABASE_URL)." };
  const db = getDb();

  const username = String(formData.get("username") ?? "").trim().slice(0, 100);
  const password = String(formData.get("password") ?? "").slice(0, 200);
  if (!username || !password) return { error: "Unesi korisničko ime i lozinku." };

  const usernameKey = username.toLowerCase();
  const meta = await getRequestMeta();
  const ip = meta.ip ?? "unknown";

  const gate = await checkLoginGate(db, usernameKey, ip);
  if (!gate.allowed) {
    await writeAudit(db, { id: null, username, ip }, { action: "login_blocked", summary: `Prijava blokirana (previše pokušaja): ${username}` });
    return { error: `Previše neuspješnih pokušaja. Pokušaj ponovo za ${gate.retryAfterMinutes} min.` };
  }

  const [user] = await db.select().from(users).where(eq(users.usernameKey, usernameKey));
  const valid = user ? await verifyPassword(user.passwordHash, password) : (await burnPasswordCheck(password), false);

  if (!user || !valid || !user.active) {
    await recordLoginAttempt(db, usernameKey, ip, false);
    await writeAudit(db, { id: user?.id ?? null, username, ip }, {
      action: "login_failed",
      summary: `Neuspješna prijava: ${username}${user && valid && !user.active ? " (nalog deaktiviran)" : ""}`,
    });
    return { error: GENERIC_ERROR };
  }

  await recordLoginAttempt(db, usernameKey, ip, true);
  if (Math.random() < 0.05) await pruneLoginAttempts(db);

  const { token, expiresAt } = await createSession(db, user.id, meta);
  await setSessionCookie(token, expiresAt);

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await writeAudit(db, { id: user.id, username: user.displayName, ip }, { action: "login", summary: `Prijava: ${user.displayName}` });
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  const token = await getSessionToken();
  if (token && hasDatabase) {
    const db = getDb();
    const current = await validateSessionToken(db, token);
    await deleteSession(db, token);
    if (current) {
      const meta = await getRequestMeta();
      await writeAudit(db, { id: current.user.id, username: current.user.displayName, ip: meta.ip }, {
        action: "logout",
        summary: `Odjava: ${current.user.displayName}`,
      });
    }
  }
  await clearSessionCookie();
  redirect("/login");
}
