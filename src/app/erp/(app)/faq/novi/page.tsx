import type { Metadata } from "next";
import { ContentEditPage } from "../../_content/ContentPages";

export const metadata: Metadata = { title: "Česta pitanja" };

export default function FaqNewPage() {
  return <ContentEditPage type="faqItem" id={null} />;
}
