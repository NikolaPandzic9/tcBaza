import { Resend } from "resend";
import { BUSINESS } from "@/lib/constants";
import type { ContactInput } from "@/lib/validation/contactSchema";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmailHtml(data: Omit<ContactInput, "website">) {
  return `
    <h2>Nova poruka sa sajta — ${escapeHtml(BUSINESS.name)}</h2>
    <p><strong>Ime:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    ${data.phone ? `<p><strong>Telefon:</strong> ${escapeHtml(data.phone)}</p>` : ""}
    <p><strong>Poruka:</strong></p>
    <p>${escapeHtml(data.message).replace(/\n/g, "<br/>")}</p>
  `;
}

export async function sendContactEmail(data: Omit<ContactInput, "website">) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.RESEND_TO_EMAIL;

  if (!apiKey || !to) {
    throw new Error("Email nije konfigurisan (nedostaje RESEND_API_KEY ili RESEND_TO_EMAIL).");
  }

  const resend = new Resend(apiKey);

  // onboarding@resend.dev is Resend's shared test sender — replace with a
  // verified address on the client's own domain before launch (HANDOVER.md).
  const { error } = await resend.emails.send({
    from: `${BUSINESS.name} <onboarding@resend.dev>`,
    to,
    replyTo: data.email,
    subject: `Nova poruka sa sajta — ${data.name}`,
    html: buildEmailHtml(data),
  });

  if (error) {
    throw new Error(error.message);
  }
}
