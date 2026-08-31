"use client";

import Link from "next/link";
import { useLang } from "@/hooks/useLang";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  const { t } = useLang();

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <span className="text-6xl font-bold text-primary">404</span>
        <h3>{t("notFound.title")}</h3>
        <p className="text-muted">{t("notFound.text")}</p>
        <Link href="/">
          <Button>{t("notFound.cta")}</Button>
        </Link>
      </div>
    </main>
  );
}
