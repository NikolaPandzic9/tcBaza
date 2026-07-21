import { Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BUSINESS } from "@/lib/constants";
import { VertebraeDivider } from "@/components/ui/VertebraeDivider";
import { buttonBaseClasses, buttonVariantClasses } from "@/components/ui/buttonStyles";
import { cn } from "@/lib/cn";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const tCta = await getTranslations("cta");

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-navy-950 px-6 py-24 text-center text-white">
      <VertebraeDivider className="pointer-events-none absolute inset-x-0 top-1/2 h-24 w-full -translate-y-1/2 text-white/5" />

      <p className="relative font-display text-sm uppercase tracking-[0.3em] text-accent-500">
        {t("eyebrow")}
      </p>
      <h1 className="relative mt-4 font-display text-4xl uppercase sm:text-5xl">
        {t("title")}
      </h1>
      <p className="relative mt-4 max-w-md text-white/70">{t("description")}</p>

      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/" className={cn(buttonBaseClasses, buttonVariantClasses.secondary)}>
          {t("cta")}
        </Link>
        <a
          href={BUSINESS.phoneHref}
          className="clip-corner inline-flex items-center gap-2 bg-transparent px-6 py-3 font-display text-sm uppercase tracking-wide text-white ring-1 ring-inset ring-white/40 transition-colors hover:bg-white/10"
        >
          <Phone className="size-4" aria-hidden />
          {tCta("call")}
        </a>
      </div>
    </main>
  );
}
