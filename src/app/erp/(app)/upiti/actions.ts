"use server";

import { redirect } from "next/navigation";
import { actorFor, requireUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { INQUIRY_STATUSES, deleteInquiry, updateInquiry, type InquiryStatus } from "@/server/inquiries";

export async function updateInquiryAction(id: string, formData: FormData) {
  const { user } = await requireUser("inquiries.manage");
  const status = String(formData.get("status") ?? "") as InquiryStatus;
  if (!INQUIRY_STATUSES.includes(status)) redirect(`/upiti/${id}`);
  const note = String(formData.get("internalNote") ?? "").trim().slice(0, 2000);
  await updateInquiry(getDb(), id, { status, internalNote: note || null }, await actorFor(user));
  redirect(`/upiti/${id}?ok=saved`);
}

export async function deleteInquiryAction(id: string) {
  const { user } = await requireUser("inquiries.manage");
  await deleteInquiry(getDb(), id, await actorFor(user));
  redirect("/upiti?ok=deleted");
}
