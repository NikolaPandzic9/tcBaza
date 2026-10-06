import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/auth/current";
import { AuthShell } from "./AuthShell";
import { LoginForm } from "./LoginForms";

export const metadata: Metadata = { title: "Prijava" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const current = await getCurrentSession();
  if (current) redirect("/");

  const { next } = await searchParams;
  return (
    <AuthShell title="Prijava" subtitle="Upravljanje sajtom, terminima i članovima.">
      <LoginForm next={next ?? "/"} />
    </AuthShell>
  );
}
