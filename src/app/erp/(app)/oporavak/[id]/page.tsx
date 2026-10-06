import type { Metadata } from "next";
import { ContentEditPage } from "../../_content/ContentPages";

export const metadata: Metadata = { title: "Oporavak" };

export default async function OporavakEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContentEditPage type="recoveryService" id={id} />;
}
