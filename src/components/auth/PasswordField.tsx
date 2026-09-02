"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/Input";
import { useLang } from "@/hooks/useLang";

/**
 * Password `Input` with a lock adornment and a show/hide toggle. Forwards every
 * `Input` prop, so `Controller` can hand it `value` / `onChange` / `error`
 * exactly as it would the plain field.
 *
 * `type` is owned here — passing one in would fight the toggle.
 */
export function PasswordField(props: Omit<InputProps, "type" | "leftIcon" | "rightIcon">) {
  const { t } = useLang();
  const [show, setShow] = useState(false);

  return (
    <Input
      {...props}
      type={show ? "text" : "password"}
      leftIcon={<Lock size={16} strokeWidth={2} aria-hidden />}
      rightIcon={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={t(show ? "auth.hidePassword" : "auth.showPassword")}
          aria-pressed={show}
          className="cursor-pointer text-muted transition-colors hover:text-brand"
        >
          {show ? (
            <EyeOff size={16} strokeWidth={2} aria-hidden />
          ) : (
            <Eye size={16} strokeWidth={2} aria-hidden />
          )}
        </button>
      }
    />
  );
}
