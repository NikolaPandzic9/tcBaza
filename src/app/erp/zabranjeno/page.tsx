import Link from "next/link";
import { buttonClass } from "@/components/erp/ui";
import { AuthShell } from "../login/AuthShell";

export const metadata = { title: "Pristup odbijen" };

export default function ForbiddenPage() {
  return (
    <AuthShell title="Pristup odbijen" subtitle="Tvoja uloga nema dozvolu za ovu stranicu. Ako ti je potrebna, javi se administratoru.">
      <Link href="/" className={buttonClass("primary", "md", "w-full")}>
        Nazad na pregled
      </Link>
    </AuthShell>
  );
}
