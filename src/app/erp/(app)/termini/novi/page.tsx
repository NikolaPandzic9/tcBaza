import type { Metadata } from "next";
import { ContentEditPage } from "../../_content/ContentPages";

export const metadata: Metadata = { title: "Novi termin" };

export default function NewTerminPage() {
  return <ContentEditPage type="termin" id={null} />;
}
