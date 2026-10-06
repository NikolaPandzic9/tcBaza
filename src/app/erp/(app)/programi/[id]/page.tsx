import type { Metadata } from "next";
import { ContentEditPage } from "../../_content/ContentPages";

export const metadata: Metadata = { title: "Programi i cijene" };

export default async function ProgramiEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContentEditPage type="program" id={id} />;
}
