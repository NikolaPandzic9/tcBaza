"use client";

import { KeyRound } from "lucide-react";
import { useActionState } from "react";
import { Field, SubmitButton, inputClass } from "@/components/erp/client";
import { Alert } from "@/components/erp/ui";
import { changePasswordAction, type ProfileState } from "./actions";

export function ChangePasswordForm() {
  const [state, action] = useActionState<ProfileState, FormData>(changePasswordAction, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <Field id="pw-current" label="Trenutna lozinka" required>
        <input id="pw-current" name="current" type="password" autoComplete="current-password" className={inputClass} />
      </Field>
      <Field id="pw-next" label="Nova lozinka" required hint="Najmanje 10 znakova, barem tri od: mala slova, velika slova, brojevi, simboli.">
        <input id="pw-next" name="next" type="password" autoComplete="new-password" className={inputClass} />
      </Field>
      <Field id="pw-confirm" label="Ponovi novu lozinku" required>
        <input id="pw-confirm" name="confirm" type="password" autoComplete="new-password" className={inputClass} />
      </Field>
      <SubmitButton variant="primary" className="w-full">
        <KeyRound className="size-4" aria-hidden />
        Promijeni lozinku
      </SubmitButton>
      <p className="text-xs text-charcoal-500">Nakon promjene odjavljuješ se sa svih ostalih uređaja.</p>
    </form>
  );
}
