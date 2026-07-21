"use client";

import { Loader2, Send } from "lucide-react";
import { useActionState, useState } from "react";
import type { Locale } from "@/i18n/routing";
import { submitContactForm, type ContactFormState } from "@/lib/actions/contactActions";
import { buttonBaseClasses, buttonVariantClasses } from "@/components/ui/buttonStyles";
import { cn } from "@/lib/cn";

interface ContactFormProps {
  locale: Locale;
}

const INITIAL_STATE: ContactFormState = { status: "idle", message: "" };

const LABELS = {
  bs: {
    name: "Ime i prezime",
    email: "Email",
    phone: "Telefon (opciono)",
    message: "Poruka",
    submit: "Pošalji poruku",
    sending: "Šaljem...",
  },
  en: {
    name: "Full name",
    email: "Email",
    phone: "Phone (optional)",
    message: "Message",
    submit: "Send message",
    sending: "Sending...",
  },
} as const;

const EMPTY_VALUES = { name: "", email: "", phone: "", message: "" };

export function ContactForm({ locale }: ContactFormProps) {
  const t = LABELS[locale];
  const boundAction = submitContactForm.bind(null, locale);
  const [state, formAction, isPending] = useActionState(boundAction, INITIAL_STATE);

  // Controlled fields: React 19's <form action={...}> clears uncontrolled
  // inputs on every submit (success or error) since it's a real form
  // submission cycle — without this, a user who mistypes their email
  // would lose everything else they'd typed.
  const [values, setValues] = useState(EMPTY_VALUES);

  // Adjust state during render (not an effect) on success, per React's
  // guidance for resetting state in response to a changed value from an
  // external source (here, the action result) — see "Adjusting some
  // state when a prop changes" in the React docs.
  const [lastHandledState, setLastHandledState] = useState(state);
  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state.status === "success") setValues(EMPTY_VALUES);
  }

  function updateField(field: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {/* Honeypot — hidden from sighted users, real inputs go untouched by bots that skip type="hidden" but still fill visible-looking fields. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-navy-900">
          {t.name}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={100}
          value={values.name}
          onChange={updateField("name")}
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
          className="mt-1.5 w-full border border-charcoal-300 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-navy-700 focus:outline-none"
        />
        {state.fieldErrors?.name && (
          <p id="name-error" className="mt-1 text-xs text-status-full-text">
            {state.fieldErrors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-navy-900">
          {t.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={values.email}
          onChange={updateField("email")}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          className="mt-1.5 w-full border border-charcoal-300 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-navy-700 focus:outline-none"
        />
        {state.fieldErrors?.email && (
          <p id="email-error" className="mt-1 text-xs text-status-full-text">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-navy-900">
          {t.phone}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          maxLength={30}
          value={values.phone}
          onChange={updateField("phone")}
          className="mt-1.5 w-full border border-charcoal-300 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-navy-700 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-navy-900">
          {t.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          value={values.message}
          onChange={updateField("message")}
          aria-invalid={Boolean(state.fieldErrors?.message)}
          aria-describedby={state.fieldErrors?.message ? "message-error" : undefined}
          className="mt-1.5 w-full border border-charcoal-300 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-navy-700 focus:outline-none"
        />
        {state.fieldErrors?.message && (
          <p id="message-error" className="mt-1 text-xs text-status-full-text">
            {state.fieldErrors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={cn(buttonBaseClasses, buttonVariantClasses.primary, "w-full sm:w-auto")}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t.sending}
          </>
        ) : (
          <>
            <Send className="size-4" aria-hidden />
            {t.submit}
          </>
        )}
      </button>

      {state.status !== "idle" && (
        <p
          role="status"
          className={cn(
            "text-sm font-medium",
            state.status === "success" ? "text-status-free-text" : "text-status-full-text",
          )}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
