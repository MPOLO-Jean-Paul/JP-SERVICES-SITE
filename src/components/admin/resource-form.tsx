"use client";
import { useActionState, useEffect, useState } from "react";
import { Save } from "lucide-react";
import type { FormState } from "@/server/actions/contact";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

export type FieldDef = { name: string; label: string; type?: "text" | "textarea" | "number" | "date" | "time" | "datetime-local" | "email" | "url" | "select" | "checkbox" | "file" | "password"; required?: boolean; hint?: string; options?: Array<{ value: string; label: string }>; placeholder?: string; rows?: number; accept?: string; step?: string; min?: string | number; max?: string | number; half?: boolean; group?: string; value?: string | number | boolean | null };

export function ResourceForm({ action, fields, submitLabel = "Enregistrer", children, resetOnSuccess }: { action: (prev: FormState, fd: FormData) => Promise<FormState>; fields: FieldDef[]; submitLabel?: string; children?: React.ReactNode; resetOnSuccess?: boolean }) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { status: "idle" });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (resetOnSuccess && state.status === "success") {
      const id = requestAnimationFrame(() => setVersion((v) => v + 1));
      return () => cancelAnimationFrame(id);
    }
  }, [state, resetOnSuccess]);
  const v = state.status === "success" && resetOnSuccess ? {} : (state.values ?? {});
  const val = (f: FieldDef) => (f.name in v ? v[f.name] : f.value == null ? "" : String(f.value));
  // Group related settings without changing names or payload sent to the server.
  const groups = fields.reduce<Array<{ name: string | null; fields: FieldDef[] }>>((acc, f) => {
    const name = f.group ?? null;
    const last = acc[acc.length - 1];
    if (last && last.name === name) last.fields.push(f);
    else acc.push({ name, fields: [f] });
    return acc;
  }, []);
  const renderField = (f: FieldDef) => {
    const id = `f-${f.name}`;
    const wrap = f.half ? "" : "sm:col-span-2";
    if (f.type === "checkbox") return (
      <div key={f.name} className={wrap}>
        <Checkbox id={id} name={f.name} value="1"
          defaultChecked={f.name in v ? v[f.name] === "1" : Boolean(f.value)}
          label={f.label} />
        {f.hint ? <p className="hint ml-7">{f.hint}</p> : null}
      </div>
    );
    return (
      <Field key={f.name} label={f.label} htmlFor={id} hint={f.hint}
        optional={!f.required} className={wrap}>
        {f.type === "textarea"
          ? <Textarea id={id} name={f.name} rows={f.rows ?? 5} required={f.required}
              placeholder={f.placeholder} defaultValue={val(f)} />
          : f.type === "select"
          ? <Select id={id} name={f.name} required={f.required} defaultValue={val(f)}>
              {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          : f.type === "file"
          ? <Input id={id} name={f.name} type="file" accept={f.accept} required={f.required}
              className="file:mr-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary" />
          : <Input id={id} name={f.name} type={f.type ?? "text"} required={f.required}
              placeholder={f.placeholder} defaultValue={val(f)}
              step={f.step} min={f.min} max={f.max} />}
      </Field>
    );
  };
  return (
    <form action={formAction} className="jp-admin-resource-form min-w-0 space-y-5" noValidate key={version}>
      {state.status === "error" ? <Alert tone="danger">{state.message}</Alert> : null}
      {state.status === "success" ? <Alert tone="success">{state.message}</Alert> : null}
      <div className="space-y-6">
        {groups.map(({ name, fields: groupFields }, index) => (
          <section key={name ?? `unfiled-${index}`}
            className={name ? "jp-admin-settings-group" : "min-w-0"}
            aria-labelledby={name ? `jp-settings-heading-${index}` : undefined}>
            {name ? (
              <header className="jp-admin-settings-group-header">
                <span className="jp-admin-settings-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h2 id={`jp-settings-heading-${index}`} className="text-base font-semibold text-ink">{name}</h2>
              </header>
            ) : null}
            <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-5">
              {groupFields.map(renderField)}
            </div>
          </section>
        ))}
      </div>
      {children}
      <div className="jp-admin-form-actions flex flex-wrap justify-end border-t pt-5"><SubmitButton><Save /> {submitLabel}</SubmitButton></div>
    </form>
  );
}
