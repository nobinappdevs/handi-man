"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLang } from "@/hooks/useLang";

/** Floating scroll-to-top button — appears once the page is scrolled a screenful. */
export function BackToTop() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label={t("common.back")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 end-6 z-50 grid h-11 w-11 place-items-center rounded-full bg-primary text-white shadow-card transition hover:bg-primary/90"
    >
      <ArrowUp size={18} strokeWidth={2.5} aria-hidden />
    </button>
  );
}
