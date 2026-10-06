import type { Metadata } from "next";
import type { SearchParams } from "@/components/erp/ui";
import { ContentListPage } from "../_content/ContentPages";

export const metadata: Metadata = { title: "Partneri" };

export default async function PartneriListPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <ContentListPage
      type="partner"
      searchParams={await searchParams}
      description="Partneri na stranici „Partneri“."
      columns={[
        { label: "Naziv", sortKey: "name", render: (d) => d.draft.name },
        { label: "Kategorija", render: (d) => d.draft.category.bs },
        { label: "Web", render: (d) => d.draft.url || "—", className: "text-xs text-charcoal-500" },
        { label: "Redoslijed", sortKey: "order", render: (d) => d.draft.order },
      ]}
    />
  );
}
