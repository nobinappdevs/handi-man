"use client";

import toast from "react-hot-toast";
import { useLang } from "@/hooks/useLang";
import { SOCIAL_PROVIDERS } from "@/components/auth/authData";

/**
 * The "or" rule and the three provider buttons, shared by login and register.
 *
 * There is no OAuth endpoint in the API collection yet, so these say so when
 * pressed rather than failing silently. A button that looks live and does
 * nothing is the worse of the two options — and when the endpoints land, the
 * only change here is swapping the toast for the redirect.
 */
export function SocialSignIn() {
  const { t } = useLang();

  return (
    <>
      {/* "or" sitting on the rule: the label paints the page background over the
          line, rather than the line being split into two elements. */}
      <div className="relative my-[clamp(20px,2.2vw,28px)] flex items-center justify-center">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-border" />
        <span className="relative bg-bg px-3 text-[13.5px] text-muted">{t("auth.or")}</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {SOCIAL_PROVIDERS.map((provider) => (
          <button
            key={provider.key}
            type="button"
            onClick={() => toast(t("auth.social.unavailable"))}
            aria-label={t("auth.social." + provider.key)}
            className="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-heading transition-colors hover:border-primary/50 hover:bg-surface"
          >
            {provider.mark}
          </button>
        ))}
      </div>
    </>
  );
}
