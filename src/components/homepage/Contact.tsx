"use client";

import { useState } from "react";
import Image from "next/image";
import {
  useForm,
  Controller,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  ChevronDown,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Eyebrow } from "@/components/share/Eyebrow";
import { SERVICE_KEYS } from "@/components/homepage/homeData";
import {
  contactRequestSchema,
  type ContactRequest,
} from "@/schemas/contact.schema";
import { cn } from "@/components/ui/cn";
import contactPhoto from "@public/assets/home/contact-photo.webp";
import contactFigure from "@public/assets/home/contact-figure.webp";
import contactPattern from "@public/assets/home/contact-pattern.webp";

/* Fields sit on the plum panel, so they are translucent white rather than the
   `field-*` tokens the booking band uses on its light panel. */
const FIELD =
  "h-[46px] w-full border bg-white/[0.12] px-4 text-[15px] font-medium text-white outline-none transition-colors placeholder:text-white/55 focus:border-white/60";

const ERROR_TEXT =
  "mt-1.5 block text-[12.5px] font-medium text-red-300";

/**
 * Contact section: a photo panel with a "verified" badge on the left, and a
 * plum request form on the right with the cut-out figure standing in it.
 *
 * Validation is local (Zod + RHF); on submit the button switches to its sent
 * label, matching how the hero band behaves. Wire the mutation in when the
 * contact endpoint exists — toast and navigation belong in that hook, not here.
 */
export function Contact() {
  const { t } = useLang();
  const [sent, setSent] = useState(false);

  const serviceOptions = SERVICE_KEYS.map((key) => ({
    value: key,
    label: t(`home.services.${key}`),
  }));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactRequest>({
    resolver: zodResolver(contactRequestSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      service: SERVICE_KEYS[0],
      message: "",
    },
  });

  return (
    <section className="relative bg-bg px-[clamp(18px,3vw,44px)] pt-[clamp(20px,3vw,40px)] pb-[clamp(48px,6vw,96px)]">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-stretch overflow-hidden wide:grid-cols-[minmax(0,1.14fr)_minmax(0,0.86fr)]">

        {/* ── Photo + verified badge ── */}
        <div className="relative z-0 min-h-[300px] mid:min-h-[380px] wide:min-h-[560px]">
          <Image
            src={contactPhoto}
            alt={t("home.contact.photoAlt")}
            fill
            sizes="(max-width: 980px) 100vw, 57vw"
            className="object-cover"
          />

          <div className="absolute bottom-0 left-0 flex w-[min(100%,86%)] items-center gap-4 bg-ink px-[clamp(16px,2vw,24px)] py-[clamp(14px,1.8vw,20px)] wide:w-[min(100%,78%)]">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-primary text-white">
              <ShieldCheck
                size={18}
                strokeWidth={2.2}
                aria-hidden
              />
            </span>

            <span className="text-[clamp(13.5px,1.1vw,15px)] font-bold leading-[1.35] text-white">
              {t("home.contact.badge")}
            </span>
          </div>
        </div>

        {/* ── Request form ── */}
        <div className="relative z-10 overflow-visible px-[clamp(20px,2.4vw,34px)] py-[clamp(28px,4.4vw,64px)]">

          {/* Purple background layer */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[linear-gradient(160deg,rgb(var(--primary__color))_0%,rgb(var(--primary-dark))_100%)]"
          >
            {/* Topographic contour overlay */}
            <Image
              src={contactPattern}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 980px) 100vw, 43vw"
              className="object-cover opacity-70"
            />

            {/* Soft highlight in the upper right */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_80%_at_80%_8%,rgba(255,255,255,0.14),rgba(255,255,255,0)_62%)]"
            />
          </div>

          {/* The figure */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-[10%] bottom-0 z-20 hidden aspect-[433/577] h-[62%] wide:block"
          >
            <Image
              src={contactFigure}
              alt=""
              fill
              sizes="20vw"
              className="object-contain object-bottom"
            />
          </div>

          {/* ── Form content ── */}
          <div className="relative z-30 flex flex-col gap-[clamp(14px,1.6vw,20px)] wide:max-w-[90%] wide:-translate-x-[30%]">

            <Eyebrow
              className="text-white"
              icon={
                <MessageSquare
                  size={16}
                  strokeWidth={2.4}
                  aria-hidden
                />
              }
            >
              {t("home.contact.eyebrow")}
            </Eyebrow>

            <h2 className="text-[clamp(28px,3.6vw,50px)] leading-[1.06] text-white text-balance">
              {t("home.contact.title")}
            </h2>

            <form
              noValidate
              onSubmit={handleSubmit(() => setSent(true))}
              className="mt-1 flex flex-col gap-5"
            >
              <div className="grid grid-cols-1 gap-5 mid:grid-cols-2">

                {/* Full Name */}
                <Field
                  name="full_name"
                  control={control}
                  errors={errors}
                  placeholder={t("home.contact.fullName")}
                  onEdit={() => setSent(false)}
                />

                {/* Email */}
                <Field
                  name="email"
                  type="email"
                  control={control}
                  errors={errors}
                  placeholder={t("home.contact.email")}
                  onEdit={() => setSent(false)}
                />

                {/* Phone */}
                <Field
                  name="phone"
                  type="tel"
                  control={control}
                  errors={errors}
                  placeholder={t("home.contact.phone")}
                  onEdit={() => setSent(false)}
                />

                {/* Service */}
                <div>
                  <label className="relative flex h-[46px] items-center border border-white/25 bg-white/[0.12] px-4">
                    <Controller
                      name="service"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          aria-label={t("home.contact.serviceLabel")}
                          onChange={(e) => {
                            field.onChange(e);
                            setSent(false);
                          }}
                          className="w-full cursor-pointer appearance-none border-0 bg-transparent pe-5 text-[15px] font-semibold text-white outline-none"
                        >
                          {serviceOptions.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                              className="bg-card text-heading"
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />

                    <ChevronDown
                      size={14}
                      strokeWidth={2.6}
                      aria-hidden
                      className="pointer-events-none absolute end-4 text-white/70"
                    />
                  </label>
                </div>
              </div>

              {/* Message */}
              <div>
                <Controller
                  name="message"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      aria-label={t("home.contact.message")}
                      aria-invalid={
                        errors.message ? true : undefined
                      }
                      placeholder={t("home.contact.message")}
                      onChange={(e) => {
                        field.onChange(e);
                        setSent(false);
                      }}
                      className={cn(
                        FIELD,
                        "h-auto min-h-[92px] resize-y py-3 leading-[1.5]",
                        errors.message
                          ? "border-red-400"
                          : "border-white/25",
                      )}
                    />
                  )}
                />

                {errors.message && (
                  <span className={ERROR_TEXT}>
                    {errors.message.message}
                  </span>
                )}
              </div>

              {/* Submit */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <button
                  type="submit"
                  className="flex h-[46px] w-full cursor-pointer items-center justify-center gap-2.5 bg-ink font-display text-[15px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-primary-dark mid:w-[56%]"
                >
                  {t(
                    sent
                      ? "home.contact.sent"
                      : "home.contact.submit",
                  )}

                  <ArrowRight
                    size={15}
                    strokeWidth={2.6}
                    aria-hidden
                  />
                </button>

                <span className="text-[12.5px] font-medium text-white/70">
                  {t("home.contact.replyNote")}
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Text input on the plum panel. The error line only appears once there is an
   error, so the resting state matches the design exactly. */
function Field({
  name,
  control,
  errors,
  placeholder,
  onEdit,
  type = "text",
}: {
  name: "full_name" | "email" | "phone";
  control: Control<ContactRequest>;
  errors: FieldErrors<ContactRequest>;
  placeholder: string;
  onEdit: () => void;
  type?: string;
}) {
  const error = errors[name];

  return (
    <div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            aria-label={placeholder}
            aria-invalid={error ? true : undefined}
            placeholder={placeholder}
            onChange={(e) => {
              field.onChange(e);
              onEdit();
            }}
            className={cn(
              FIELD,
              error
                ? "border-red-400"
                : "border-white/25",
            )}
          />
        )}
      />

      {error && (
        <span className={ERROR_TEXT}>
          {error.message}
        </span>
      )}
    </div>
  );
}