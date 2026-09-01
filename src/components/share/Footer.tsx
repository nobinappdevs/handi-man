"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowUp, ChevronDown, Mail, MapPin, Phone, Smartphone, Wrench } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import {
  FOOTER_CONTACT_KEYS,
  FOOTER_LINK_KEYS,
  FOOTER_SOCIAL_ICONS,
} from "@/components/homepage/homeData";
import { newsletterSchema, type NewsletterRequest } from "@/schemas/newsletter.schema";
import { cn } from "@/components/ui/cn";

const CONTACT_ICONS = { phone: Phone, email: Mail, address: MapPin };
const LINK_HREFS: Record<string, string> = {
  privacyPolicy: "/privacy-policy",
  termsConditions: "/terms-and-conditions",
};

/** Site-wide footer — always the design's dark plum/ink treatment regardless
 *  of the page theme (`bg-ink`/`bg-primary` are theme-invariant tokens, so no
 *  `data-theme` override is needed). */
export function Footer() {
  const { t } = useLang();
  const [subscribed, setSubscribed] = useState(false);

  const { control, handleSubmit } = useForm<NewsletterRequest>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { name: "", email: "" },
  });

  return (
    <footer className="mt-[clamp(56px,6vw,90px)] bg-ink text-white">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-stretch wide:grid-cols-[0.82fr_1.18fr]">
        {/* ── Brand panel ── */}
        <div className="relative min-w-0 overflow-hidden bg-primary p-[clamp(38px,4.4vw,64px)_clamp(22px,3vw,52px)]">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-[14%] -bottom-[26%] h-[clamp(220px,26vw,380px)] w-[clamp(220px,26vw,380px)] rounded-full border border-white/[0.16]"
          />

          <div className="relative flex h-full flex-col gap-[22px]">
            <Link href="/" className="flex items-center gap-[11px] hover:text-inherit">
              <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white text-primary">
                <Wrench size={19} strokeWidth={2.4} aria-hidden />
              </span>
              <span className="text-[23px] font-extrabold tracking-[-0.025em] text-white">
                {t("brand.name")}
              </span>
            </Link>

            <p className="max-w-[330px] text-[clamp(15px,1.4vw,17px)] leading-[1.65] text-white/85">
              {t("footer.tagline")}
            </p>

            <div className="mt-auto flex flex-col pt-[18px]">
              {FOOTER_CONTACT_KEYS.map((key) => {
                const Icon = CONTACT_ICONS[key as keyof typeof CONTACT_ICONS];
                return (
                  <a
                    key={key}
                    href="#"
                    className="flex items-center gap-[13px] border-t border-white/[0.22] py-3.5 text-[14.5px] font-semibold text-white transition-[padding-left] duration-200 hover:pl-1.5"
                  >
                    <Icon size={15} strokeWidth={2} aria-hidden />
                    {t(`footer.contacts.${key}`)}
                  </a>
                );
              })}
            </div>

            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 self-start border border-white/[0.32] px-[15px] py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-primary"
            >
              {t("footer.language")}
              <ChevronDown size={10} strokeWidth={2.8} aria-hidden />
            </button>
          </div>
        </div>

        {/* ── Newsletter + links ── */}
        <div className="flex min-w-0 flex-col gap-[clamp(28px,3vw,42px)] p-[clamp(38px,4.4vw,64px)_clamp(22px,3vw,52px)]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5 font-display text-[13px] font-bold tracking-[0.2em] text-white/60 uppercase">
              <span className="h-0.5 w-[26px] bg-primary" />
              {t("footer.newsletter.eyebrow")}
            </div>
            <p className="max-w-[520px] text-[clamp(17px,1.7vw,22px)] leading-[1.35] font-bold tracking-[-0.02em] text-white text-pretty">
              {t("footer.newsletter.title")}
            </p>

            <form
              onSubmit={handleSubmit(() => setSubscribed(true))}
              className="flex flex-wrap gap-2.5"
            >
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder={t("footer.newsletter.namePlaceholder")}
                    aria-label={t("footer.newsletter.namePlaceholder")}
                    onChange={(e) => {
                      field.onChange(e);
                      setSubscribed(false);
                    }}
                    className="h-[52px] min-w-0 flex-[1_1_140px] border border-white/20 bg-white/5 px-4 text-[14.5px] font-semibold text-white outline-none placeholder:text-white/55 focus:border-primary"
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    placeholder={t("footer.newsletter.emailPlaceholder")}
                    aria-label={t("footer.newsletter.emailPlaceholder")}
                    onChange={(e) => {
                      field.onChange(e);
                      setSubscribed(false);
                    }}
                    className="h-[52px] min-w-0 flex-[1.2_1_150px] border border-white/20 bg-white/5 px-4 text-[14.5px] font-semibold text-white outline-none placeholder:text-white/55 focus:border-primary"
                  />
                )}
              />
              <button
                type="submit"
                className="flex h-[52px] flex-none cursor-pointer items-center gap-2.5 border-0 bg-primary px-[26px] font-display text-[14.5px] font-bold tracking-[0.14em] text-white uppercase transition-colors hover:bg-white hover:text-primary"
              >
                {t(subscribed ? "footer.newsletter.subscribed" : "footer.newsletter.subscribe")}
                <ArrowRight size={15} strokeWidth={2.6} aria-hidden />
              </button>
            </form>
          </div>

          <div className="h-px bg-white/[0.14]" />

          <div className="grid grid-cols-1 gap-[clamp(24px,3vw,48px)] mid:grid-cols-[0.7fr_1.3fr]">
            <div className="flex min-w-0 flex-col gap-4">
              <h3 className="font-display text-[13px] font-bold tracking-[0.2em] text-white/60 uppercase">
                {t("footer.links.title")}
              </h3>
              <div className="flex flex-col gap-3">
                {FOOTER_LINK_KEYS.map((key) => (
                  <Link
                    key={key}
                    href={LINK_HREFS[key]}
                    className="text-[15.5px] font-semibold tracking-[-0.01em] text-white/85 transition-colors hover:text-brand"
                  >
                    {t(`footer.links.items.${key}`)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <h3 className="font-display text-[13px] font-bold tracking-[0.2em] text-white/60 uppercase">
                {t("footer.download.title")}
              </h3>
              <p className="text-[14.5px] leading-[1.6] text-white/70">{t("footer.download.text")}</p>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href="#"
                  className="flex h-[50px] w-[150px] flex-none items-center justify-center gap-2 border border-white/[0.18] px-3 text-white transition-colors hover:border-white/40"
                >
                  <Smartphone size={18} strokeWidth={2} aria-hidden />
                  <span className="text-[13px] font-semibold">{t("footer.download.appStore")}</span>
                </a>
                <a
                  href="#"
                  className="flex h-[50px] w-[150px] flex-none items-center justify-center gap-2 border border-white/[0.18] px-3 text-white transition-colors hover:border-white/40"
                >
                  <Smartphone size={18} strokeWidth={2} aria-hidden />
                  <span className="text-[13px] font-semibold">{t("footer.download.googlePlay")}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.14]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3.5 px-[clamp(22px,3vw,52px)] py-[clamp(15px,1.7vw,20px)]">
          <p className="text-[13.5px] font-semibold text-white/66">
            {t("footer.copyrightLabel")} {new Date().getFullYear()}. {t("footer.copyrightNote")}
          </p>

          <div className="flex items-center gap-2.5">
            {FOOTER_SOCIAL_ICONS.map((icon, i) => (
              <a
                key={i}
                href="#"
                className={cn(
                  "flex h-[34px] w-[34px] items-center justify-center border border-white/[0.22] text-white transition-colors",
                  "hover:border-primary hover:bg-primary",
                )}
              >
                {icon}
              </a>
            ))}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              title={t("footer.backToTop")}
              aria-label={t("footer.backToTop")}
              className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center border border-white/[0.22] bg-transparent text-white transition-colors hover:border-primary hover:bg-primary"
            >
              <ArrowUp size={14} strokeWidth={2.4} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
