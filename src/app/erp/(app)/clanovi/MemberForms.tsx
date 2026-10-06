"use client";

import { CalendarPlus, CreditCard, Save } from "lucide-react";
import { useActionState, useState } from "react";
import { Field, SubmitButton, inputClass } from "@/components/erp/client";
import { Alert } from "@/components/erp/ui";
import type { FormState } from "./actions";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

interface MemberValues {
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  note: string | null;
  active: boolean;
}

function err(state: FormState, key: string) {
  return state.fieldErrors?.[key];
}

export function MemberForm({ action, initial, submitLabel }: { action: Action; initial?: MemberValues; submitLabel: string }) {
  const [state, formAction] = useActionState(action, {});
  const v = initial;
  const input = (name: keyof MemberValues, label: string, opts: { type?: string; required?: boolean; autoComplete?: string; inputMode?: "tel" | "email" } = {}) => (
    <Field id={`m-${name}`} label={label} error={err(state, name)} required={opts.required}>
      <input
        id={`m-${name}`}
        name={name}
        type={opts.type ?? "text"}
        inputMode={opts.inputMode}
        autoComplete={opts.autoComplete ?? "off"}
        defaultValue={(v?.[name] as string | null) ?? ""}
        aria-invalid={Boolean(err(state, name)) || undefined}
        className={inputClass}
      />
    </Field>
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <div className="grid gap-5 sm:grid-cols-2">
        {input("firstName", "Ime", { required: true })}
        {input("lastName", "Prezime", { required: true })}
        {input("phone", "Telefon", { type: "tel", inputMode: "tel" })}
        {input("email", "Email", { type: "email", inputMode: "email" })}
        {input("birthDate", "Datum rođenja", { type: "date" })}
        <div className="hidden sm:block" />
        {input("guardianName", "Roditelj / staratelj", {})}
        {input("guardianPhone", "Telefon roditelja", { type: "tel", inputMode: "tel" })}
        <Field id="m-note" label="Napomena" className="sm:col-span-2" error={err(state, "note")}>
          <textarea id="m-note" name="note" rows={3} defaultValue={v?.note ?? ""} className={inputClass} />
        </Field>
        <label className="flex items-center gap-3 text-sm sm:col-span-2">
          <input type="checkbox" name="active" defaultChecked={v?.active ?? true} className="size-4 accent-navy-700" />
          <span>
            <span className="font-semibold text-navy-900">Aktivan član</span>
            <span className="block text-xs text-charcoal-500">Neaktivni članovi ne zauzimaju mjesta na terminima.</span>
          </span>
        </label>
      </div>
      <div className="flex justify-end">
        <SubmitButton variant="accent">
          <Save className="size-4" aria-hidden />
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}

export interface TierOption {
  programKey: string;
  programName: string;
  label: string;
  price: number | null;
}

function addMonth(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + 1);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function MembershipForm({ action, tiers, today, canPay }: { action: Action; tiers: TierOption[]; today: string; canPay: boolean }) {
  const [state, formAction] = useActionState(action, {});
  const [tierIndex, setTierIndex] = useState(0);
  const tier = tiers[tierIndex];
  const [label, setLabel] = useState(tier ? `${tier.programName} — ${tier.label}` : "");
  const [price, setPrice] = useState(tier?.price?.toString() ?? "");
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(addMonth(today));
  const [paid, setPaid] = useState(true);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <input type="hidden" name="programKey" value={tier?.programKey ?? ""} />
      <Field id="ms-tier" label="Program i stavka cjenovnika" required>
        <select
          id="ms-tier"
          value={tierIndex}
          onChange={(e) => {
            const i = Number(e.target.value);
            setTierIndex(i);
            setLabel(`${tiers[i].programName} — ${tiers[i].label}`);
            setPrice(tiers[i].price?.toString() ?? "");
          }}
          className={inputClass}
        >
          {tiers.map((t, i) => (
            <option key={`${t.programKey}-${t.label}`} value={i}>
              {t.programName} — {t.label}
              {t.price !== null ? ` (${t.price} KM)` : ""}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="ms-label" label="Naziv članarine" error={err(state, "label")} required>
          <input id="ms-label" name="label" value={label} onChange={(e) => setLabel(e.target.value)} className={inputClass} />
        </Field>
        <Field id="ms-price" label="Cijena (KM)" error={err(state, "price")} required>
          <input id="ms-price" name="price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
        </Field>
        <Field id="ms-start" label="Početak" error={err(state, "startDate")} required>
          <input
            id="ms-start"
            name="startDate"
            type="date"
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              if (e.target.value) setEnd(addMonth(e.target.value));
            }}
            className={inputClass}
          />
        </Field>
        <Field id="ms-end" label="Ističe" error={err(state, "endDate")} required>
          <input id="ms-end" name="endDate" type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
        </Field>
      </div>
      <Field id="ms-note" label="Napomena">
        <input id="ms-note" name="note" className={inputClass} />
      </Field>
      {canPay && (
        <div className="flex flex-wrap items-center gap-4 border border-charcoal-200 bg-navy-50 px-3 py-2.5 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="paidNow" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="size-4 accent-navy-700" />
            Plaćeno odmah (evidentiraj uplatu)
          </label>
          {paid && (
            <select name="method" aria-label="Način plaćanja" className={`${inputClass} w-auto py-1.5`}>
              <option value="gotovina">Gotovina</option>
              <option value="kartica">Kartica</option>
              <option value="uplata">Uplata na račun</option>
            </select>
          )}
        </div>
      )}
      <div className="flex justify-end">
        <SubmitButton variant="accent">
          <CalendarPlus className="size-4" aria-hidden />
          Dodaj članarinu
        </SubmitButton>
      </div>
    </form>
  );
}

export function PaymentForm({
  action,
  memberships,
  today,
}: {
  action: Action;
  memberships: { id: string; label: string; price: number }[];
  today: string;
}) {
  const [state, formAction] = useActionState(action, {});
  const [membershipId, setMembershipId] = useState(memberships[0]?.id ?? "");
  const [amount, setAmount] = useState(memberships[0]?.price.toString() ?? "");
  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="p-membership" label="Za članarinu">
          <select
            id="p-membership"
            name="membershipId"
            value={membershipId}
            onChange={(e) => {
              setMembershipId(e.target.value);
              const m = memberships.find((x) => x.id === e.target.value);
              if (m) setAmount(m.price.toString());
            }}
            className={inputClass}
          >
            <option value="">— Bez veze s članarinom —</option>
            {memberships.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="p-amount" label="Iznos (KM)" error={err(state, "amount")} required>
          <input id="p-amount" name="amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
        </Field>
        <Field id="p-date" label="Datum uplate" error={err(state, "paidAt")} required>
          <input id="p-date" name="paidAt" type="date" defaultValue={today} className={inputClass} />
        </Field>
        <Field id="p-method" label="Način">
          <select id="p-method" name="method" className={inputClass}>
            <option value="gotovina">Gotovina</option>
            <option value="kartica">Kartica</option>
            <option value="uplata">Uplata na račun</option>
          </select>
        </Field>
      </div>
      <Field id="p-note" label="Napomena">
        <input id="p-note" name="note" className={inputClass} />
      </Field>
      <div className="flex justify-end">
        <SubmitButton variant="accent">
          <CreditCard className="size-4" aria-hidden />
          Evidentiraj uplatu
        </SubmitButton>
      </div>
    </form>
  );
}
