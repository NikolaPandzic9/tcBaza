import type { Metadata } from "next";
import { Pill, type SearchParams } from "@/components/erp/ui";
import { ContentListPage } from "../_content/ContentPages";

export const metadata: Metadata = { title: "Tim" };

export default async function TimListPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <ContentListPage
      type="teamMember"
      searchParams={await searchParams}
      description="Članovi tima na stranici „Naš tim“. Oni s oznakom „Vodi termine“ biraju se kao treneri na terminima."
      columns={[
        { label: "Ime", sortKey: "name", render: (d) => d.draft.name },
        { label: "Uloga", render: (d) => d.draft.role.bs },
        { label: "Vodi termine", render: (d) => (d.draft.leadsSessions ? <Pill tone="lime">Da</Pill> : <Pill tone="gray">Ne</Pill>) },
        { label: "Fotografija", render: (d) => (d.draft.photoId ? "Da" : "—") },
        { label: "Redoslijed", sortKey: "order", render: (d) => d.draft.order },
      ]}
    />
  );
}
