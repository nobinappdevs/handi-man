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
import { useGsapScope } from "@/hooks/useGsap";
import { Eyebrow } from "@/components/share/Eyebrow";
import { SERVICE_KEYS } from "@/components/homepage/homeData";
import {
  contactRequestSchema,
  type ContactRequest,
} from "@/schemas/contact.schema";
import { cn } from "@/components/ui/cn";
import contactPhoto from "@public/assets/home/contact-photo.webp";

/* Fields sit on the plum panel, so they are translucent white rather than the
   `field-*` tokens the booking band uses on its light panel. */
const FIELD =
  "h-[54px] w-full border bg-white/[0.12] px-4 text-[14.5px] font-medium text-white outline-none transition-colors placeholder:text-white/55 focus:border-white/60";

const ERROR_TEXT = "mt-1.5 block text-[12.5px] font-medium text-red-300";

/**
 * Contact section: a worksite photo with a "verified" badge on the left, and
 * a frosted plum request form floating over the seam on the right — the
 * form card is pulled left with a negative margin so it overlaps the photo
 * panel rather than sitting flush beside it, matching the design's glass
 * card treatment. Below `wide:` it drops the blur/shadow/overlap and just
 * stacks full-width.
 *
 * Validation is local (Zod + RHF); on submit the button switches to its sent
 * label. Wire the mutation in when the contact endpoint exists — toast and
 * navigation belong in that hook, not here.
 */
export function Contact() {
  const { t } = useLang();
  const scope = useGsapScope();
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
    <section
      ref={scope}
      className="brand-wash relative [--wash-angle:332deg] [--wash-strength:6%] pb-[clamp(40px,5vw,80px)]"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-stretch wide:grid-cols-[0.6fr_0.4fr]">
        {/* ── Photo + verified badge ── */}
        <div className="relative min-h-[360px] min-w-0 overflow-hidden wide:min-h-[640px]">
          <Image
            src={contactPhoto}
            alt={t("home.contact.photoAlt")}
            fill
            sizes="(max-width: 980px) 100vw, 60vw"
            className="object-cover"
            data-anim-parallax="-46"
            data-anim-scale="1.08"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(18,16,15,0)_40%,rgba(18,16,15,0.35)_100%)]" />

          <div
            className="absolute bottom-0 left-0 flex w-[min(340px,72%)] items-center gap-4 bg-ink px-[22px] py-[18px] text-white"
            data-anim="left"
          >
            <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-full bg-primary">
              <ShieldCheck size={20} strokeWidth={2} aria-hidden />
            </span>
            <p className="text-[clamp(15px,1.4vw,18px)] leading-[1.3] font-extrabold tracking-[-0.02em]">
              {t("home.contact.badge")}
            </p>
          </div>
        </div>

        {/* ── Plum panel ──
            No `overflow-hidden` here: the frosted card below is deliberately
            pulled left past this panel's own edge (see its comment). Clipping
            it here would hard-cut the blur mid-photo instead of letting it
            bleed over the seam. The decorative circles/dots below have their
            own scoped `overflow-hidden` so they still can't leak past the
            section. */}
        <div className="relative min-w-0 bg-primary p-[clamp(34px,4.4vw,64px)_clamp(20px,3vw,56px)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
            data-anim="fade"
          >
            <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_88%_6%,rgba(255,255,255,0.18),rgba(255,255,255,0)_60%)]" />
            <div className="absolute -top-[16%] -right-[8%] h-[clamp(280px,32vw,460px)] w-[clamp(280px,32vw,460px)] rounded-full border border-white/[0.18]" />
            <div className="absolute -top-[4%] right-[2%] h-[clamp(190px,22vw,330px)] w-[clamp(190px,22vw,330px)] rounded-full border border-white/[0.12]" />
            <div className="absolute right-[12%] bottom-[8%] h-[clamp(110px,12vw,170px)] w-[clamp(110px,12vw,170px)] rotate-[22deg] rounded-[22px] border border-white/[0.16]" />
            <div className="absolute bottom-[6%] left-[5%] h-[clamp(110px,13vw,180px)] w-[clamp(110px,13vw,180px)] opacity-45 bg-[radial-gradient(rgba(255,255,255,0.55)_1.3px,transparent_1.3px)] bg-[length:16px_16px]" />
            <div className="absolute inset-y-0 left-[14%] w-px skew-x-[-13deg] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.2)_45%,rgba(255,255,255,0)_100%)]" />
          </div>

          {/* Frosted card — floats over the photo/panel seam from `wide:` up. */}
          <div className="relative z-[3] flex flex-col gap-[clamp(16px,2vw,22px)] wide:max-w-[560px] wide:-ml-[46%] wide:bg-[color-mix(in_oklab,rgb(var(--primary__color))_55%,transparent)] wide:p-[clamp(26px,2.6vw,38px)] wide:shadow-[0_40px_90px_-40px_rgba(0,0,0,0.55)] wide:backdrop-blur-[18px]">
            <Eyebrow
              className="text-white/85"
              icon={<MessageSquare size={16} strokeWidth={2.6} aria-hidden />}
              data-anim="up"
            >
              {t("home.contact.eyebrow")}
            </Eyebrow>

            <h2
              className="text-[clamp(28px,3.4vw,46px)] leading-[1.06] text-white text-balance"
              data-anim-split
            >
              {t("home.contact.title")}
            </h2>

            <form
              noValidate
              onSubmit={handleSubmit(() => setSent(true))}
              className="flex flex-col gap-3"
            >
              <div
                className="grid grid-cols-1 gap-3 mid:grid-cols-2"
                data-anim-stagger="up"
                data-anim-gap="0.07"
              >
                <Field
                  name="full_name"
                  control={control}
                  errors={errors}
                  placeholder={t("home.contact.fullName")}
                  onEdit={() => setSent(false)}
                />
                <Field
                  name="email"
                  type="email"
                  control={control}
                  errors={errors}
                  placeholder={t("home.contact.email")}
                  onEdit={() => setSent(false)}
                />
                <Field
                  name="phone"
                  type="tel"
                  control={control}
                  errors={errors}
                  placeholder={t("home.contact.phone")}
                  onEdit={() => setSent(false)}
                />

                <div>
                  <label className="relative flex h-[54px] items-center border border-white/[0.28] bg-white/[0.12] px-4">
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
                          className="w-full cursor-pointer appearance-none border-0 bg-transparent pe-[18px] text-[14.5px] font-semibold text-white outline-none"
                        >
                          {serviceOptions.map((option) => (
                            <option key={option.value} value={option.value} style={{ color: "#12100f" }}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <ChevronDown
                      size={12}
                      strokeWidth={2.6}
                      aria-hidden
                      className="pointer-events-none absolute end-[14px] text-white/70"
                    />
                  </label>
                </div>
              </div>

              <div data-anim="up" data-anim-delay="0.1">
                <Controller
                  name="message"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={4}
                      aria-label={t("home.contact.message")}
                      aria-invalid={errors.message ? true : undefined}
                      placeholder={t("home.contact.message")}
                      onChange={(e) => {
                        field.onChange(e);
                        setSent(false);
                      }}
                      className={cn(
                        FIELD,
                        "h-auto resize-y py-3.5 leading-[1.5]",
                        errors.message ? "border-red-400" : "border-white/[0.28]",
                      )}
                    />
                  )}
                />
                {errors.message && <span className={ERROR_TEXT}>{errors.message.message}</span>}
              </div>

              <div className="flex flex-wrap items-center gap-3.5" data-anim="up" data-anim-delay="0.16">
                <button
                  type="submit"
                  className="flex h-14 flex-1 min-w-[200px] cursor-pointer items-center justify-center gap-2.5 bg-ink font-display text-[15px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-ink"
                >
                  {t(sent ? "home.contact.sent" : "home.contact.submit")}
                  <ArrowRight size={15} strokeWidth={2.6} aria-hidden />
                </button>

                <p className="text-[12.5px] font-semibold text-white/80">{t("home.contact.replyNote")}</p>
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
            className={cn(FIELD, error ? "border-red-400" : "border-white/[0.28]")}
          />
        )}
      />
      {error && <span className={ERROR_TEXT}>{error.message}</span>}
    </div>
  );
}
