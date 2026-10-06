import type { Metadata } from "next";
import { ContentEditPage } from "../../_content/ContentPages";

export const metadata: Metadata = { title: "Česta pitanja" };

export default async function FaqEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContentEditPage type="faqItem" id={id} />;
}
