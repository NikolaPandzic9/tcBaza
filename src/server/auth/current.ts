import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Actor } from "../audit";
import { getDb, hasDatabase } from "../db/client";
import { can, type Permission } from "./permissions";
import { validateSessionToken, type SessionMeta } from "./sessions";

/**
 * __Host- prefix (production): the browser only accepts it over HTTPS,
 * with Path=/ and no Domain — so no other subdomain can set or read it.
 */
export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-tcbaza_erp" : "tcbaza_erp";

export async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function getRequestMeta(): Promise<SessionMeta> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  return { ip, userAgent: h.get("user-agent") };
}

/** The signed-in session for this request (deduplicated per render). */
export const getCurrentSession = cache(async () => {
  if (!hasDatabase) return null;
  const token = await getSessionToken();
  if (!token) return null;
  return validateSessionToken(getDb(), token);
});

/** Gate for every ERP page and action. Redirects instead of rendering. */
export async function requireUser(permission?: Permission) {
  const current = await getCurrentSession();
  if (!current) redirect("/login");
  if (permission && !can(current.user.role, permission)) redirect("/zabranjeno");
  return current;
}

export async function actorFor(user: { id: string; displayName: string }): Promise<Actor> {
  const meta = await getRequestMeta();
  return { id: user.id, username: user.displayName, ip: meta.ip };
}
