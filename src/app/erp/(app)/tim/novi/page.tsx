import type { Metadata } from "next";
import { ContentEditPage } from "../../_content/ContentPages";

export const metadata: Metadata = { title: "Tim" };

export default function TimNewPage() {
  return <ContentEditPage type="teamMember" id={null} />;
}
