import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/erp/ui";
import { requireUser } from "@/server/auth/current";
import { createMemberAction } from "../actions";
import { MemberForm } from "../MemberForms";

export const metadata: Metadata = { title: "Novi član" };

export default async function NewMemberPage() {
  await requireUser("members.edit");
  return (
    <>
      <PageHeader title="Novi član" back={{ href: "/clanovi", label: "Članovi" }} />
      <Card className="max-w-3xl">
        <MemberForm action={createMemberAction} submitLabel="Sačuvaj člana" />
      </Card>
    </>
  );
}
