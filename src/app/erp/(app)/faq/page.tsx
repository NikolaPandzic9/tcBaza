import type { Metadata } from "next";
import type { SearchParams } from "@/components/erp/ui";
import { ContentListPage } from "../_content/ContentPages";

export const metadata: Metadata = { title: "Česta pitanja" };

export default async function FaqListPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <ContentListPage
      type="faqItem"
      searchParams={await searchParams}
      description="Pitanja na početnoj stranici. Pitanja za pojedinačne programe uređuju se u samom programu."
      columns={[
        { label: "Pitanje", sortKey: "question", render: (d) => d.draft.question.bs },
        { label: "Redoslijed", sortKey: "order", render: (d) => d.draft.order },
      ]}
    />
  );
}
