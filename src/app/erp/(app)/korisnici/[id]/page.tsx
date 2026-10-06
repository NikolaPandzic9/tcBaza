import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, PageHeader, Pill, formatDateTime } from "@/components/erp/ui";
import { requireUser } from "@/server/auth/current";
import { ROLE_LABELS } from "@/server/auth/permissions";
import { getDb } from "@/server/db/client";
import { getUser } from "@/server/users";
import { deleteUserAction, resetPasswordAction, updateUserAction } from "../actions";
import { DeleteUserButton, ResetPasswordForm, UserForm } from "../UserForms";

export const metadata: Metadata = { title: "Korisnik" };

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { user: me } = await requireUser("users.manage");
  const { id } = await params;
  const user = await getUser(getDb(), id);
  if (!user) notFound();
  const isSelf = user.id === me.id;

  return (
    <>
      <PageHeader
        title={user.displayName}
        back={{ href: "/korisnici", label: "Korisnici" }}
        description={`@${user.username} · kreiran ${formatDateTime(user.createdAt)} · zadnja prijava ${formatDateTime(user.lastLoginAt)}`}
        actions={<Pill tone="navy">{ROLE_LABELS[user.role]}</Pill>}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card title="Nalog">
          <UserForm action={updateUserAction.bind(null, user.id)} initial={user} isNew={false} isSelf={isSelf} />
        </Card>
        <aside className="space-y-6">
          {!isSelf && (
            <Card title="Nova lozinka">
              <p className="mb-4 text-xs text-charcoal-500">Za zaboravljenu lozinku. Korisnik se odjavljuje sa svih uređaja.</p>
              <ResetPasswordForm action={resetPasswordAction.bind(null, user.id)} />
            </Card>
          )}
          {!isSelf && (
            <Card title="Brisanje">
              <DeleteUserButton action={deleteUserAction.bind(null, user.id)} name={user.displayName} />
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
