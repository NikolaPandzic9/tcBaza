import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDocumentByKey } from "@/server/content/documents";
import { getDb } from "@/server/db/client";
import { ContentEditPage } from "../_content/ContentPages";

export const metadata: Metadata = { title: "Podešavanja" };

export default async function SettingsPage() {
  const doc = await getDocumentByKey(getDb(), "siteSettings", "siteSettings");
  if (!doc) notFound();
  return <ContentEditPage type="siteSettings" id={doc.id} title="Podešavanja sajta" />;
}
