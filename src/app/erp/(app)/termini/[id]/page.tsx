import type { Metadata } from "next";
import { getDocument } from "@/server/content/documents";
import { getDb } from "@/server/db/client";
import { ContentEditPage } from "../../_content/ContentPages";
import { TerminEnrollments } from "../TerminEnrollments";

export const metadata: Metadata = { title: "Termin" };

export default async function TerminEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDocument(getDb(), "termin", id);
  return (
    <ContentEditPage
      type="termin"
      id={id}
      below={doc && !doc.deletedAt ? <TerminEnrollments terminId={id} termin={doc.published ?? doc.draft} /> : null}
    />
  );
}
