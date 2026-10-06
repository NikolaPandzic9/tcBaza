import type { Metadata } from "next";
import { ContentEditPage } from "../../_content/ContentPages";

export const metadata: Metadata = { title: "Oporavak" };

export default function OporavakNewPage() {
  return <ContentEditPage type="recoveryService" id={null} />;
}
