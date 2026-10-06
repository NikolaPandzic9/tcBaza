import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/erp/ui";
import { requireUser } from "@/server/auth/current";
import { createUserAction } from "../actions";
import { UserForm } from "../UserForms";

export const metadata: Metadata = { title: "Novi korisnik" };

export default async function NewUserPage() {
  await requireUser("users.manage");
  return (
    <>
      <PageHeader title="Novi korisnik" back={{ href: "/korisnici", label: "Korisnici" }} description="Lozinku proslijedi korisniku lično; preporuči da je promijeni nakon prve prijave." />
      <Card className="max-w-3xl">
        <UserForm action={createUserAction} isNew />
      </Card>
    </>
  );
}
