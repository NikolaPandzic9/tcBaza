"use server";

import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { actorFor, requireUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import {
  addMembership,
  addPayment,
  createMember,
  deleteMember,
  deleteMembership,
  deletePayment,
  memberSchema,
  membershipSchema,
  paymentSchema,
  updateMember,
} from "@/server/members/members";

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
}

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");
const num = (fd: FormData, key: string) => {
  const raw = str(fd, key).replace(",", ".").trim();
  return raw === "" ? Number.NaN : Number(raw);
};

function errorsOf(error: ZodError): FormState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
  return { error: "Provjeri označena polja.", fieldErrors };
}

function memberInput(fd: FormData) {
  return {
    firstName: str(fd, "firstName"),
    lastName: str(fd, "lastName"),
    phone: str(fd, "phone"),
    email: str(fd, "email"),
    birthDate: str(fd, "birthDate"),
    guardianName: str(fd, "guardianName"),
    guardianPhone: str(fd, "guardianPhone"),
    note: str(fd, "note"),
    active: fd.get("active") === "on",
  };
}

export async function createMemberAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { user } = await requireUser("members.edit");
  const parsed = memberSchema.safeParse(memberInput(fd));
  if (!parsed.success) return errorsOf(parsed.error);
  const member = await createMember(getDb(), parsed.data, await actorFor(user));
  redirect(`/clanovi/${member.id}?ok=created`);
}

export async function updateMemberAction(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const { user } = await requireUser("members.edit");
  const parsed = memberSchema.safeParse(memberInput(fd));
  if (!parsed.success) return errorsOf(parsed.error);
  await updateMember(getDb(), id, parsed.data, await actorFor(user));
  redirect(`/clanovi/${id}?ok=saved`);
}

export async function deleteMemberAction(id: string) {
  const { user } = await requireUser("members.edit");
  await deleteMember(getDb(), id, await actorFor(user));
  redirect("/clanovi?ok=deleted");
}

export async function addMembershipAction(memberId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const { user } = await requireUser("members.edit");
  const parsed = membershipSchema.safeParse({
    programKey: str(fd, "programKey"),
    label: str(fd, "label"),
    price: num(fd, "price"),
    startDate: str(fd, "startDate"),
    endDate: str(fd, "endDate"),
    note: str(fd, "note"),
  });
  if (!parsed.success) return errorsOf(parsed.error);
  const actor = await actorFor(user);
  const membership = await addMembership(getDb(), memberId, parsed.data, actor);

  // Paid on the spot? Record the payment in the same step.
  if (fd.get("paidNow") === "on") {
    await addPayment(
      getDb(),
      memberId,
      {
        amount: parsed.data.price,
        paidAt: parsed.data.startDate,
        method: (str(fd, "method") || "gotovina") as "gotovina",
        membershipId: membership.id,
        note: null,
      },
      actor,
    );
  }
  redirect(`/clanovi/${memberId}?ok=saved`);
}

export async function deleteMembershipAction(memberId: string, membershipId: string) {
  const { user } = await requireUser("members.edit");
  await deleteMembership(getDb(), memberId, membershipId, await actorFor(user));
  redirect(`/clanovi/${memberId}?ok=deleted`);
}

export async function addPaymentAction(memberId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const { user } = await requireUser("payments.manage");
  const parsed = paymentSchema.safeParse({
    amount: num(fd, "amount"),
    paidAt: str(fd, "paidAt"),
    method: str(fd, "method"),
    membershipId: str(fd, "membershipId"),
    note: str(fd, "note"),
  });
  if (!parsed.success) return errorsOf(parsed.error);
  await addPayment(getDb(), memberId, parsed.data, await actorFor(user));
  redirect(`/clanovi/${memberId}?ok=saved`);
}

export async function deletePaymentAction(memberId: string, paymentId: string) {
  const { user } = await requireUser("payments.manage");
  await deletePayment(getDb(), memberId, paymentId, await actorFor(user));
  redirect(`/clanovi/${memberId}?ok=deleted`);
}
