"use server";

import { redirect } from "next/navigation";
import { actorFor, requireUser } from "@/server/auth/current";
import { getDb } from "@/server/db/client";
import { UserError, createUser, deleteUser, resetPassword, updateUser, userSchema } from "@/server/users";

export interface UserFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function read(fd: FormData) {
  return {
    username: String(fd.get("username") ?? ""),
    displayName: String(fd.get("displayName") ?? ""),
    email: String(fd.get("email") ?? ""),
    role: String(fd.get("role") ?? ""),
    active: fd.get("active") === "on",
  };
}

function zodErrors(issues: { path: PropertyKey[]; message: string }[]): UserFormState {
  const fieldErrors: Record<string, string> = {};
  for (const i of issues) fieldErrors[i.path.join(".")] ??= i.message;
  return { error: "Provjeri označena polja.", fieldErrors };
}

export async function createUserAction(_prev: UserFormState, fd: FormData): Promise<UserFormState> {
  const { user } = await requireUser("users.manage");
  const parsed = userSchema.safeParse(read(fd));
  if (!parsed.success) return zodErrors(parsed.error.issues);
  const password = String(fd.get("password") ?? "");
  if (password !== String(fd.get("passwordConfirm") ?? "")) return { fieldErrors: { passwordConfirm: "Lozinke se ne podudaraju." } };
  let id: string;
  try {
    id = (await createUser(getDb(), { ...parsed.data, password }, await actorFor(user))).id;
  } catch (error) {
    if (error instanceof UserError) return { error: error.message };
    throw error;
  }
  redirect(`/korisnici/${id}?ok=created`);
}

export async function updateUserAction(id: string, _prev: UserFormState, fd: FormData): Promise<UserFormState> {
  const { user } = await requireUser("users.manage");
  const parsed = userSchema.omit({ username: true }).safeParse(read(fd));
  if (!parsed.success) return zodErrors(parsed.error.issues);
  try {
    await updateUser(getDb(), id, parsed.data, await actorFor(user));
  } catch (error) {
    if (error instanceof UserError) return { error: error.message };
    throw error;
  }
  redirect(`/korisnici/${id}?ok=saved`);
}

export async function resetPasswordAction(id: string, _prev: UserFormState, fd: FormData): Promise<UserFormState> {
  const { user } = await requireUser("users.manage");
  const password = String(fd.get("password") ?? "");
  if (password !== String(fd.get("passwordConfirm") ?? "")) return { fieldErrors: { passwordConfirm: "Lozinke se ne podudaraju." } };
  try {
    await resetPassword(getDb(), id, password, await actorFor(user));
  } catch (error) {
    if (error instanceof UserError) return { error: error.message };
    throw error;
  }
  redirect(`/korisnici/${id}?ok=password`);
}

export async function deleteUserAction(id: string): Promise<UserFormState> {
  const { user } = await requireUser("users.manage");
  try {
    await deleteUser(getDb(), id, await actorFor(user));
  } catch (error) {
    if (error instanceof UserError) return { error: error.message };
    throw error;
  }
  redirect("/korisnici?ok=deleted");
}
