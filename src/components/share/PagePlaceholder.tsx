"use client";

// Temporary stand-in so every route in the file formation resolves and the
// static build emits its .html. Replace the import in the matching page.tsx
// with the real screen component as each design arrives — the route file
// itself does not change.

import { Construction } from "lucide-react";
import { Container } from "@/components/share/Container";

export function PagePlaceholder({ title, note }: { title: string; note?: string }) {
  return (
    <Container className="py-24">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Construction size={22} strokeWidth={2} aria-hidden />
        </span>
        <h4>{title}</h4>
        <p className="text-muted">{note ?? "Awaiting design."}</p>
      </div>
    </Container>
  );
}
