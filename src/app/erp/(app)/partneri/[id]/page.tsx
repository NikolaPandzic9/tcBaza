import type { Metadata } from "next";
import { ContentEditPage } from "../../_content/ContentPages";

export const metadata: Metadata = { title: "Partneri" };

export default async function PartneriEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContentEditPage type="partner" id={id} />;
}
