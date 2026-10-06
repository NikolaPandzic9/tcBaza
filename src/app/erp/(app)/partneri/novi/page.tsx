import type { Metadata } from "next";
import { ContentEditPage } from "../../_content/ContentPages";

export const metadata: Metadata = { title: "Partneri" };

export default function PartneriNewPage() {
  return <ContentEditPage type="partner" id={null} />;
}
