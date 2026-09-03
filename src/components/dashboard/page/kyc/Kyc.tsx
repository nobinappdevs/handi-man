"use client";

import { useEffect, useMemo, useRef } from "react";
import { Controller, useForm, type Control, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleCheckBig, CircleX, Clock, IdCard, ShieldCheck, Upload } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useKycFields, useSubmitKyc, KYC_UNVERIFIED, KYC_VERIFIED, KYC_PENDING, KYC_REJECTED } from "@/hooks/useKyc";
import { Panel, PanelHeader, PANEL_BODY, FieldLabel, SkLine } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { applyServerErrors } from "@/components/auth/serverErrors";
import type { KycData, KycField } from "@/services/kyc.service";

type StatusMeta = { labelKey: string; noteKey: string; tone: string; Icon: typeof ShieldCheck };

const STATUS: Record<number, StatusMeta> = {
  [KYC_UNVERIFIED]: { labelKey: "statusUnverified", noteKey: "noteUnverified", tone: "bg-warn/14 text-warn", Icon: ShieldCheck },
  [KYC_VERIFIED]:   { labelKey: "statusVerified",   noteKey: "noteVerified",   tone: "bg-ok/14 text-ok",     Icon: CircleCheckBig },
  [KYC_PENDING]:    { labelKey: "statusPending",    noteKey: "notePending",    tone: "bg-brand/14 text-brand", Icon: Clock },
  [KYC_REJECTED]:   { labelKey: "statusRejected",   noteKey: "noteRejected",   tone: "bg-danger/14 text-danger", Icon: CircleX },
};

/** Values are whatever the server asked for — a string, or a File for uploads. */
type KycValues = Record<string, string | File | undefined>;

/**
 * The form is defined by the SERVER (`input_fields`), so its schema cannot be
 * written at build time — it is assembled from the field list on arrival.
 *
 * The project's rule is RHF + `zodResolver`, and this keeps it rather than
 * dropping to uncontrolled inputs: the same `required` / `mimes` the API sends
 * become real Zod rules, so a missing document is caught before the request and
 * reported under its own field.
 */
function schemaFor(fields: KycField[], t: (k: string) => string) {
  const required = t("dashboard.kyc.fieldRequired");
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const f of fields) {
    if (f.type === "file") {
      const file = z.instanceof(File, { message: required });
      shape[f.name] = f.required ? file : file.optional();
      continue;
    }
    /* The message goes on the TYPE check as well as `.min`. A field the user
       never touched arrives as `undefined`, which fails `z.string()` itself —
       without a message there it reports Zod's "expected string, received
       undefined" instead of the required copy. */
    const text = z.string({ message: required }).trim();
    shape[f.name] = f.required ? text.min(1, required) : text.optional();
  }
  return z.object(shape);
}

function KycControl({
  field,
  control,
  errors,
}: {
  field: KycField;
  control: Control<KycValues>;
  errors: FieldErrors<KycValues>;
}) {
  const { t } = useLang();
  const message = errors[field.name]?.message as string | undefined;
  const accept = (field.validation?.mimes ?? []).map((m) => `.${m}`).join(",");

  if (field.type === "select") {
    return (
      <div>
        <FieldLabel required={field.required}>{field.label}</FieldLabel>
        <Controller
          name={field.name}
          control={control}
          render={({ field: rhf }) => (
            <Select
              value={(rhf.value as string) ?? ""}
              onChange={rhf.onChange}
              options={(field.validation?.options ?? []).map((o) => ({ value: o, label: o }))}
              placeholder={`${t("dashboard.kyc.selectPrefix")} ${field.label}`}
              required={field.required}
            />
          )}
        />
        {message && <p className="mt-1.5 text-[12.5px] text-danger">{message}</p>}
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <div>
        <FieldLabel required={field.required}>{field.label}</FieldLabel>
        <Controller
          name={field.name}
          control={control}
          render={({ field: rhf }) => (
            <label
              className={`flex cursor-pointer items-center gap-3 border bg-surface px-4 py-3 transition-colors hover:border-primary ${
                message ? "border-danger" : "border-border"
              }`}
            >
              <span className="flex h-8 w-8 flex-none items-center justify-center bg-brand/14 text-brand">
                <Upload size={15} strokeWidth={2} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-heading">
                {rhf.value instanceof File ? rhf.value.name : t("dashboard.kyc.chooseFile")}
              </span>
              <input
                type="file"
                accept={accept || undefined}
                className="sr-only"
                /* `value` is deliberately not bound — a file input's value
                   cannot be set programmatically, and RHF holds the File. */
                onChange={(e) => rhf.onChange(e.target.files?.[0])}
                onBlur={rhf.onBlur}
                name={rhf.name}
              />
            </label>
          )}
        />
        {accept && !message && (
          <p className="mt-1.5 text-[12.5px] text-muted">
            {t("dashboard.kyc.accepts")} {field.validation.mimes?.join(", ")}
          </p>
        )}
        {message && <p className="mt-1.5 text-[12.5px] text-danger">{message}</p>}
      </div>
    );
  }

  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: rhf }) => (
        <Input
          value={(rhf.value as string) ?? ""}
          onChange={rhf.onChange}
          onBlur={rhf.onBlur}
          name={rhf.name}
          type={field.type === "number" ? "number" : "text"}
          required={field.required}
          label={field.label}
          placeholder={field.label}
          error={message}
        />
      )}
    />
  );
}

export function Kyc() {
  const { t } = useLang();
  const { data: res, isLoading } = useKycFields();
  const submit = useSubmitKyc();

  const kyc = (res as { data?: KycData } | undefined)?.data;
  const status = kyc?.kyc_status ?? KYC_UNVERIFIED;
  /* Memoised because `?? []` is a fresh array every render, which would make
     the resolver below rebuild on every render instead of when the field list
     actually changes. */
  const fields = useMemo(() => kyc?.input_fields ?? [], [kyc]);
  const meta = STATUS[status] ?? STATUS[KYC_UNVERIFIED];

  /* Only Unverified and Rejected can submit. Pending is waiting on a reviewer
     and Verified is done — showing the form in either would invite a
     re-submission the API rejects. */
  const canSubmit = status === KYC_UNVERIFIED || status === KYC_REJECTED;

  /* The cast is the price of a runtime schema: `z.object` over a computed
     shape infers `Record<string, unknown>`, which TypeScript cannot line up
     with `KycValues` because it has no way to know the field list. The schema
     is still doing the real validation — this only re-labels its type.

     Rebuilt whenever `fields` changes: the first render has none, and RHF
     reads `resolver` off the latest props on every submit, so the form starts
     validating properly the moment the definition lands. */
  const resolver = useMemo(
    () => zodResolver(schemaFor(fields, t)) as unknown as Resolver<KycValues>,
    [fields, t],
  );
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<KycValues>({ resolver });

  /* Seed "" for every text and select field once the definition lands, so the
     inputs are controlled from their first render rather than flipping from
     uncontrolled. Keyed on the field NAMES, not the array, so a refetch that
     returns the same form does not wipe what the user has typed. */
  const seeded = useRef("");
  useEffect(() => {
    const signature = fields.map((f) => f.name).join("|");
    if (!signature || seeded.current === signature) return;
    seeded.current = signature;
    reset(
      Object.fromEntries(
        fields.filter((f) => f.type !== "file").map((f) => [f.name, ""]),
      ),
    );
  }, [fields, reset]);

  const onSubmit = (values: KycValues) =>
    submit.mutate(values, {
      onSuccess: () => reset(),
      onError: (err) =>
        applyServerErrors(
          err,
          setError,
          Object.fromEntries(fields.map((f) => [f.name, f.name])),
        ),
    });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-[clamp(16px,1.8vw,24px)]">
      {/* ── status ── */}
      <Panel>
        <div className={`flex items-center gap-4 ${PANEL_BODY}`}>
          <span className={`flex h-12 w-12 flex-none items-center justify-center ${meta.tone}`}>
            <meta.Icon size={22} strokeWidth={2} aria-hidden />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[clamp(16px,1.6vw,19px)] font-bold tracking-[-0.02em] text-heading">
                {t("dashboard.kyc.title")}
              </span>
              <span className={`px-2 py-0.5 text-[11.5px] font-bold tracking-[0.1em] uppercase ${meta.tone}`}>
                {t(`dashboard.kyc.${meta.labelKey}`)}
              </span>
            </span>
            <p className="text-[13.5px] leading-[1.5]">
              {kyc?.status_info || t(`dashboard.kyc.${meta.noteKey}`)}
            </p>
          </div>
        </div>
      </Panel>

      {/* ── form ── */}
      {canSubmit && (
        <Panel>
          <PanelHeader title={t("dashboard.kyc.formTitle")}>
            <IdCard size={16} strokeWidth={2} className="flex-none text-muted" aria-hidden />
          </PanelHeader>

          {isLoading ? (
            <div className={`flex flex-col gap-5 ${PANEL_BODY}`}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <SkLine className="h-3 w-24" />
                  <SkLine className="h-11 w-full" />
                </div>
              ))}
            </div>
          ) : fields.length === 0 ? (
            <p className={`text-center text-[13.5px] text-muted ${PANEL_BODY}`}>
              {t("dashboard.kyc.noFields")}
            </p>
          ) : (
            <form noValidate onSubmit={handleSubmit(onSubmit)} className={`flex flex-col gap-5 ${PANEL_BODY}`}>
              {fields.map((f) => (
                <KycControl key={f.name} field={f} control={control} errors={errors} />
              ))}
              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={submit.isPending}
                leftIcon={<ShieldCheck size={17} strokeWidth={2.5} aria-hidden />}
              >
                {t("dashboard.kyc.submit")}
              </Button>
            </form>
          )}
        </Panel>
      )}
    </div>
  );
}
