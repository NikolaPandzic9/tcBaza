import Link from "next/link";
import { buttonClass } from "@/components/erp/ui";
import { AuthShell } from "./login/AuthShell";

export default function ErpNotFound() {
  return (
    <AuthShell title="Stranica ne postoji" subtitle="Zapis je možda obrisan ili je link neispravan.">
      <Link href="/" className={buttonClass("primary", "md", "w-full")}>
        Nazad na pregled
      </Link>
    </AuthShell>
  );
}
