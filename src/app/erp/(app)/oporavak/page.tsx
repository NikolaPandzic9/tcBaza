import type { Metadata } from "next";
import type { SearchParams } from "@/components/erp/ui";
import { ContentListPage } from "../_content/ContentPages";

export const metadata: Metadata = { title: "Oporavak" };

export default async function OporavakListPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <ContentListPage
      type="recoveryService"
      searchParams={await searchParams}
      description="Usluge oporavka i njihov cjenovnik (stranice „Oporavak“ i „Članarine i cijene“)."
      columns={[
        { label: "Naziv", sortKey: "name", render: (d) => d.draft.name.bs },
        { label: "Cijene", render: (d) => d.draft.prices.map((p) => `${p.amount} KM`).join(" · "), className: "text-xs text-charcoal-500" },
        { label: "Redoslijed", sortKey: "order", render: (d) => d.draft.order },
      ]}
    />
  );
}
