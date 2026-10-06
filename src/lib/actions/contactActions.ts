"use server";

import { headers } from "next/headers";
import type { Locale } from "@/i18n/routing";
import { sendContactEmail } from "@/lib/email/sendContactEmail";
import { isRateLimited } from "@/lib/rateLimit";
import { contactSchema } from "@/lib/validation/contactSchema";
import { getDb, hasDatabase } from "@/server/db/client";
import { createInquiry, markInquiryEmailed } from "@/server/inquiries";

export interface ContactFormState {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<"name" | "email" | "phone" | "message", string>>;
}

const MESSAGES = {
  bs: {
    invalid: "Provjeri unesene podatke i pokušaj ponovo.",
    rateLimited: "Previše pokušaja. Pokušaj ponovo za par minuta ili nas pozovi direktno.",
    serverError:
      "Došlo je do greške pri slanju poruke. Pokušaj ponovo ili nas pozovi direktno.",
    success: "Poruka je poslana. Javićemo se uskoro.",
    fieldName: "Unesi ime (najmanje 2 znaka).",
    fieldEmail: "Unesi ispravnu email adresu.",
    fieldMessage: "Poruka mora imati najmanje 10 znakova.",
  },
  en: {
    invalid: "Check the fields below and try again.",
    rateLimited: "Too many attempts. Try again in a few minutes or call us directly.",
    serverError: "Something went wrong sending your message. Try again or call us directly.",
    success: "Message sent. We'll get back to you soon.",
    fieldName: "Enter your name (at least 2 characters).",
    fieldEmail: "Enter a valid email address.",
    fieldMessage: "Message must be at least 10 characters.",
  },
} as const;

export async function submitContactForm(
  locale: Locale,
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const t = MESSAGES[locale];

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return { status: "error", message: t.rateLimited };
  }

  const raw = {
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    message: formData.get("message")?.toString() ?? "",
    website: formData.get("website")?.toString() ?? "",
  };

  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: ContactFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "name") fieldErrors.name = t.fieldName;
      if (field === "email") fieldErrors.email = t.fieldEmail;
      if (field === "message") fieldErrors.message = t.fieldMessage;
    }
    return { status: "error", message: t.invalid, fieldErrors };
  }

  // Honeypot tripped — pretend success, don't send anything.
  if (parsed.data.website) {
    return { status: "success", message: t.success };
  }

  const inquiry = {
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    message: parsed.data.message,
  };

  // The ERP inbox is the record of truth; email is a notification on top.
  // Either one succeeding means the message reached the team.
  let saved: { id: string } | null = null;
  if (hasDatabase) {
    try {
      saved = await createInquiry(getDb(), { ...inquiry, locale });
    } catch (error) {
      console.error("Upit nije sačuvan u bazi:", error);
    }
  }

  let emailed = false;
  try {
    await sendContactEmail(inquiry);
    emailed = true;
  } catch {
    // Not configured or provider error — the saved inquiry still counts.
  }
  if (saved && emailed) await markInquiryEmailed(getDb(), saved.id).catch(() => {});

  if (!saved && !emailed) return { status: "error", message: t.serverError };
  return { status: "success", message: t.success };
}
