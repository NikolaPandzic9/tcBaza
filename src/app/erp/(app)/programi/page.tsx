import type { Metadata } from "next";
import { Pill, type SearchParams } from "@/components/erp/ui";
import { ContentListPage } from "../_content/ContentPages";

export const metadata: Metadata = { title: "Programi i cijene" };

export default async function ProgramiListPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <ContentListPage
      type="program"
      searchParams={await searchParams}
      description="Programi s vlastitim stranicama na sajtu. Uređuješ tekstove, cijene, slike i česta pitanja; program se može sakriti, ali ne i obrisati (stranica je dio sajta)."
      columns={[
        { label: "Naziv", sortKey: "name", render: (d) => d.draft.name.bs },
        {
          label: "Cijene",
          render: (d) =>
            d.draft.tiers
              .map((t) => (t.price === null ? `${t.label.bs}: na upit` : `${t.label.bs}: ${t.price} KM`))
              .join(" · "),
          className: "text-xs text-charcoal-500",
        },
        { label: "Na sajtu", render: (d) => (d.draft.visible ? <Pill tone="green">Prikazan</Pill> : <Pill tone="gray">Sakriven</Pill>) },
        { label: "Redoslijed", sortKey: "order", render: (d) => d.draft.order },
      ]}
    />
  );
}
