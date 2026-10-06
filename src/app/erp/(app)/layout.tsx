import { LogOut } from "lucide-react";
import { count, eq } from "drizzle-orm";
import { Suspense, type ReactNode } from "react";
import { ErpShell, type NavSection } from "@/components/erp/ErpShell";
import { FlashMessage } from "@/components/erp/client";
import { SITE_URL } from "@/lib/constants";
import { requireUser } from "@/server/auth/current";
import { can, ROLE_LABELS, type Permission } from "@/server/auth/permissions";
import { getDb } from "@/server/db/client";
import { inquiries } from "@/server/db/schema";
import { logoutAction } from "../login/actions";

type Item = NavSection["items"][number] & { permission: Permission };

export default async function ErpAppLayout({ children }: { children: ReactNode }) {
  const { user } = await requireUser();

  const newInquiries = can(user.role, "inquiries.manage")
    ? (await getDb().select({ n: count() }).from(inquiries).where(eq(inquiries.status, "novo")))[0].n
    : 0;

  const sections: { title?: string; items: Item[] }[] = [
    {
      items: [
        { href: "/", label: "Pregled", icon: "dashboard", permission: "dashboard.view" },
        { href: "/termini", label: "Termini", icon: "termini", permission: "termini.view" },
        { href: "/clanovi", label: "Članovi", icon: "clanovi", permission: "members.view" },
        { href: "/uplate", label: "Uplate", icon: "uplate", permission: "payments.manage" },
        { href: "/upiti", label: "Upiti", icon: "upiti", permission: "inquiries.manage", badge: newInquiries },
      ],
    },
    {
      title: "Sajt",
      items: [
        { href: "/programi", label: "Programi i cijene", icon: "programi", permission: "content.edit" },
        { href: "/tim", label: "Tim", icon: "tim", permission: "content.edit" },
        { href: "/oporavak", label: "Oporavak", icon: "oporavak", permission: "content.edit" },
        { href: "/partneri", label: "Partneri", icon: "partneri", permission: "content.edit" },
        { href: "/faq", label: "Česta pitanja", icon: "faq", permission: "content.edit" },
        { href: "/mediji", label: "Mediji", icon: "mediji", permission: "media.manage" },
        { href: "/podesavanja", label: "Podešavanja", icon: "podesavanja", permission: "settings.edit" },
      ],
    },
    {
      title: "Administracija",
      items: [
        { href: "/korisnici", label: "Korisnici", icon: "korisnici", permission: "users.manage" },
        { href: "/aktivnost", label: "Zapisnik aktivnosti", icon: "aktivnost", permission: "audit.view" },
      ],
    },
  ];

  const visible: NavSection[] = sections
    .map((section) => ({
      title: section.title,
      items: section.items
        .filter((item) => can(user.role, item.permission))
        .map((item) => ({ href: item.href, label: item.label, icon: item.icon, badge: item.badge })),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <ErpShell
      sections={visible}
      user={{ displayName: user.displayName, roleLabel: ROLE_LABELS[user.role] }}
      siteUrl={SITE_URL}
      logout={
        <form action={logoutAction}>
          <button type="submit" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white">
            <LogOut className="size-3.5" aria-hidden />
            Odjava
          </button>
        </form>
      }
    >
      {children}
      <Suspense>
        <FlashMessage />
      </Suspense>
    </ErpShell>
  );
}
