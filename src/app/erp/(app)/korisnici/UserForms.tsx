"use client";

import { KeyRound, Save, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { Field, SubmitButton, inputClass } from "@/components/erp/client";
import { Alert, buttonClass } from "@/components/erp/ui";
import type { UserFormState } from "./actions";

type Action = (prev: UserFormState, fd: FormData) => Promise<UserFormState>;

const ROLES = [
  { value: "admin", label: "Administrator", hint: "Sve, uključujući korisnike, podešavanja i zapisnik aktivnosti." },
  { value: "urednik", label: "Urednik", hint: "Sadržaj sajta, termini, mediji, članovi, uplate i upiti." },
  { value: "trener", label: "Trener", hint: "Pregled termina i članova, upis članova na termine." },
];

export function PasswordFields({ state }: { state: UserFormState }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <Field id="u-password" label="Lozinka" hint="Najmanje 10 znakova, barem tri od: mala slova, velika slova, brojevi, simboli." required error={state.fieldErrors?.password}>
        <input id="u-password" name="password" type={show ? "text" : "password"} autoComplete="new-password" className={inputClass} />
      </Field>
      <Field id="u-password2" label="Ponovi lozinku" required error={state.fieldErrors?.passwordConfirm}>
        <input id="u-password2" name="passwordConfirm" type={show ? "text" : "password"} autoComplete="new-password" className={inputClass} />
      </Field>
      <label className="flex items-center gap-2 text-xs text-charcoal-500 sm:col-span-2">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="accent-navy-700" />
        Prikaži lozinke
      </label>
    </>
  );
}

export function UserForm({
  action,
  initial,
  isNew,
  isSelf,
}: {
  action: Action;
  initial?: { username: string; displayName: string; email: string | null; role: string; active: boolean };
  isNew: boolean;
  isSelf?: boolean;
}) {
  const [state, formAction] = useActionState(action, {});
  const [role, setRole] = useState(initial?.role ?? "urednik");
  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <div className="grid gap-5 sm:grid-cols-2">
        {isNew ? (
          <Field id="u-username" label="Korisničko ime" required error={state.fieldErrors?.username} hint="Koristi se za prijavu. Ne može se kasnije mijenjati.">
            <input id="u-username" name="username" autoComplete="off" autoCapitalize="none" className={inputClass} />
          </Field>
        ) : (
          <input type="hidden" name="username" value={initial?.username} />
        )}
        <Field id="u-display" label="Ime za prikaz" required error={state.fieldErrors?.displayName}>
          <input id="u-display" name="displayName" defaultValue={initial?.displayName} className={inputClass} />
        </Field>
        <Field id="u-email" label="Email (opciono)" error={state.fieldErrors?.email}>
          <input id="u-email" name="email" type="email" defaultValue={initial?.email ?? ""} className={inputClass} />
        </Field>
        <fieldset className="sm:col-span-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-navy-900">Uloga</legend>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            {ROLES.map((r) => (
              <label
                key={r.value}
                className={`flex cursor-pointer gap-2 border p-3 text-sm ${role === r.value ? "border-navy-700 bg-navy-50" : "border-charcoal-200"} ${isSelf && r.value !== "admin" ? "opacity-50" : ""}`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={role === r.value}
                  onChange={() => setRole(r.value)}
                  disabled={isSelf && r.value !== "admin"}
                  className="mt-0.5 accent-navy-700"
                />
                <span>
                  <span className="block font-semibold text-navy-900">{r.label}</span>
                  <span className="text-xs text-charcoal-500">{r.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {isNew && <PasswordFields state={state} />}
        <label className="flex items-center gap-3 text-sm sm:col-span-2">
          <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} disabled={isSelf} className="size-4 accent-navy-700" />
          {isSelf && <input type="hidden" name="active" value="on" />}
          <span className="font-semibold text-navy-900">Aktivan nalog</span>
        </label>
      </div>
      <div className="flex justify-end">
        <SubmitButton variant="accent">
          <Save className="size-4" aria-hidden />
          {isNew ? "Kreiraj korisnika" : "Sačuvaj izmjene"}
        </SubmitButton>
      </div>
    </form>
  );
}

export function ResetPasswordForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <div className="grid gap-4">
        <PasswordFields state={state} />
      </div>
      <SubmitButton variant="primary" className="w-full">
        <KeyRound className="size-4" aria-hidden />
        Postavi novu lozinku
      </SubmitButton>
    </form>
  );
}

export function DeleteUserButton({ action, name }: { action: () => Promise<UserFormState>; name: string }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          if (!window.confirm(`Trajno obrisati korisnika „${name}“? Njegove aktivnosti ostaju u zapisniku.`)) return;
          const result = await action();
          if (result?.error) setError(result.error);
        }}
        className={buttonClass("danger", "md", "w-full")}
      >
        <Trash2 className="size-4" aria-hidden />
        Obriši korisnika
      </button>
      {error && <p className="mt-2 text-xs text-status-full-text">{error}</p>}
    </div>
  );
}
