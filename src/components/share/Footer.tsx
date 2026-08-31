"use client";

// Public-site footer. Structure/placement is final; the visual design lands
// when the Footer design is provided.

import Link from "next/link";
import { useLang } from "@/hooks/useLang";
import { Container } from "@/components/share/Container";

const LEGAL = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
];

export function Footer() {
  const { t } = useLang();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <Container className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <span className="text-sm text-muted">
          &copy; {new Date().getFullYear()} {t("brand.name")}
        </span>

        <nav className="flex items-center gap-6">
          {LEGAL.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-muted">
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
