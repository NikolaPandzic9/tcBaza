import { LogOut, Monitor } from "lucide-react";
import type { Metadata } from "next";
import { ConfirmSubmit } from "@/components/erp/client";
import { Card, PageHeader, Pill, formatDateTime } from "@/components/erp/ui";
import { requireUser } from "@/server/auth/current";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/server/auth/permissions";
import { listUserSessions } from "@/server/auth/sessions";
import { getDb } from "@/server/db/client";
import { revokeOtherSessionsAction, revokeSessionAction } from "./actions";
import { ChangePasswordForm } from "./ProfileForms";

export const metadata: Metadata = { title: "Profil" };

function device(ua: string | null) {
  if (!ua) return "Nepoznat uređaj";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Preglednik";
  return [browser, os].filter(Boolean).join(" · ");
}

export default async function ProfilePage() {
  const { user, session } = await requireUser();
  const sessions = await listUserSessions(getDb(), user.id);

  return (
    <>
      <PageHeader title="Moj profil" description={`${user.displayName} (@${user.username}) · ${ROLE_LABELS[user.role]} — ${ROLE_DESCRIPTIONS[user.role]}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Lozinka">
          <ChangePasswordForm />
        </Card>

        <Card
          title="Aktivne sesije"
          className="lg:col-span-2"
          actions={
            sessions.length > 1 ? (
              <form action={revokeOtherSessionsAction}>
                <ConfirmSubmit message="Odjaviti sve ostale uređaje?" variant="ghost">
                  <LogOut className="size-3.5" aria-hidden />
                  Odjavi sve ostale
                </ConfirmSubmit>
              </form>
            ) : null
          }
        >
          <ul className="divide-y divide-charcoal-100">
            {sessions
              .slice()
              .reverse()
              .map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span className="flex items-center gap-3">
                    <Monitor className="size-5 text-charcoal-500" aria-hidden />
                    <span>
                      <span className="font-semibold text-navy-900">{device(s.userAgent)}</span>
                      {s.id === session.id && (
                        <span className="ml-2">
                          <Pill tone="green">Ovaj uređaj</Pill>
                        </span>
                      )}
                      <span className="block text-xs text-charcoal-500">
                        IP {s.ip ?? "—"} · prijava {formatDateTime(s.createdAt)} · aktivnost {formatDateTime(s.lastSeenAt)}
                      </span>
                    </span>
                  </span>
                  {s.id !== session.id && (
                    <form action={revokeSessionAction.bind(null, s.id)}>
                      <ConfirmSubmit message="Odjaviti ovaj uređaj?" variant="ghost">
                        Odjavi
                      </ConfirmSubmit>
                    </form>
                  )}
                </li>
              ))}
          </ul>
          <p className="mt-3 text-xs text-charcoal-500">Sesija ističe nakon 2 sata neaktivnosti, a najkasnije 12 sati nakon prijave.</p>
        </Card>
      </div>
    </>
  );
}
