"use server";

import { refresh } from "next/cache";
import { actorFor, requireUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { CapacityError, enrollMember, searchMembersForTermin, unenrollMember } from "@/server/members/enrollments";

export async function searchEnrollableMembers(terminId: string, q: string) {
  await requireUser("enrollments.manage");
  if (q.trim().length < 2) return [];
  return searchMembersForTermin(getDb(), terminId, q);
}

export async function enrollAction(terminId: string, memberId: string): Promise<{ error?: string }> {
  const { user } = await requireUser("enrollments.manage");
  try {
    await enrollMember(getDb(), terminId, memberId, await actorFor(user));
  } catch (error) {
    if (error instanceof CapacityError || error instanceof Error) return { error: error.message };
    throw error;
  }
  refresh();
  return {};
}

export async function unenrollAction(terminId: string, memberId: string) {
  const { user } = await requireUser("enrollments.manage");
  await unenrollMember(getDb(), terminId, memberId, await actorFor(user));
  refresh();
}
