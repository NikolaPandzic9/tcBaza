import type { Metadata } from "next";
import { ContentEditPage } from "../../_content/ContentPages";

export const metadata: Metadata = { title: "Tim" };

export default async function TimEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContentEditPage type="teamMember" id={id} />;
}
