import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

/**
 * Laravel answers a failed validation with `{ errors: { field: [message] } }`.
 * The hook already toasted the first of them; this puts the ones the form has a
 * field for underneath that field, where they can actually be fixed.
 *
 * `map` is API field name → form field name, because the two do not always
 * agree — `/user/forgot/password/send/otp` rejects the address under
 * `credentials`, not `email`.
 */
export function applyServerErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  map: Partial<Record<string, Path<T>>>,
) {
  const errors = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response
    ?.data?.errors;
  if (!errors) return;

  for (const [apiField, formField] of Object.entries(map)) {
    const message = errors[apiField]?.[0];
    if (message && formField) setError(formField, { type: "server", message });
  }
}
