"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Eyebrow } from "@/components/share/Eyebrow";
import { Contact } from "@/components/homepage/Contact";

/**
 * The three ways to reach us that are not the form — a contact page offering
 * only a form is a contact page you cannot use in a hurry.
 *
 * The values come from `footer.contacts`, the keys the footer already
 * publishes, so the two places cannot drift apart. `href` is derived from the
 * value for the same reason: a changed number in the dictionary changes the
 * link with it.
 */
const CHANNELS = [
  { key: "email", icon: Mail, href: (v: string) => `mailto:${v}` },
  { key: "phone", icon: Phone, href: (v: string) => `tel:${v.replace(/[^+\d]/g, "")}` },
  { key: "address", icon: MapPin, href: null },
] as const;

/**
 * The `/contact` screen: a short page head, then the request form the design
 * shares with the home page.
 *
 * `Contact` is imported as-is rather than copied — it takes no props and owns
 * its own GSAP scope. The head exists because that reveal waits for hydration
 * and so cannot hold the fold (blueprint §6.5); the head takes it with the CSS
 * `enter-*` classes, `enter-rise` on the `h1` since that is the LCP element
 * and must move without fading.
 */
export function ContactScreen() {
  const { t } = useLang();

  return (
    <>
      <section className="bg-page border-b border-border px-[clamp(18px,3vw,44px)] pt-[clamp(34px,4.5vw,66px)] pb-[clamp(30px,3.6vw,52px)]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div className="enter-group flex min-w-0 max-w-[620px] flex-col gap-3">
            <Eyebrow>{t("contactPage.eyebrow")}</Eyebrow>
            {/* `enter-rise` — transform only. This is the LCP element and an
                opacity entrance on it costs seconds of it. */}
            <h1 className="enter-rise text-balance [--enter-delay:0.08s]">
              {t("contactPage.title")}
            </h1>
            <p className="max-w-[54ch]">{t("contactPage.lead")}</p>
          </div>

          {/* Not `flex-none`: below `mid` this column wraps onto its own line
              and has to be able to shrink, or it pushes the page sideways past
              the section padding. */}
          <div className="enter-fade flex min-w-0 flex-col gap-3.5 [--enter-delay:0.24s]">
            {CHANNELS.map(({ key, icon: Icon, href }) => {
              const value = t(`footer.contacts.${key}`);

              return (
                <span key={key} className="flex min-w-0 items-center gap-3.5">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Icon size={17} strokeWidth={2.2} aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-display text-[11.5px] font-bold tracking-[0.16em] text-muted uppercase">
                      {t(`contactPage.channels.${key}`)}
                    </span>
                    {href ? (
                      <a
                        href={href(value)}
                        className="text-[15px] font-bold tracking-[-0.01em] text-heading transition-colors hover:text-brand"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="text-[15px] font-bold tracking-[-0.01em] text-heading">
                        {value}
                      </span>
                    )}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <Contact />
    </>
  );
}
