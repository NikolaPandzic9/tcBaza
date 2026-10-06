"use client";

import { Eye, EyeOff, LogIn } from "lucide-react";
import { useActionState, useState } from "react";
import { Field, SubmitButton, inputClass } from "@/components/erp/client";
import { Alert } from "@/components/erp/ui";
import { loginAction, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<LoginState, FormData>(loginAction, {});
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      {state.error && <Alert tone="error">{state.error}</Alert>}

      <Field id="username" label="Korisničko ime" required>
        <input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          autoFocus
          className={inputClass}
        />
      </Field>

      <Field id="password" label="Lozinka" required>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Sakrij lozinku" : "Prikaži lozinku"}
            aria-pressed={show}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-charcoal-500 hover:text-navy-700"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <SubmitButton variant="accent" className="w-full" pendingLabel="Prijavljujem…">
        <LogIn className="size-4" aria-hidden />
        Prijava
      </SubmitButton>
    </form>
  );
}
