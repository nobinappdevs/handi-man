"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { addressService } from "@/services/address.service";
import { getApiErrorMessage, getApiSuccessMessage } from "@/hooks/useAuth";
import type { AddressRequest } from "@/schemas/address.schema";

export const ADDRESS_KEY = ["addresses"] as const;

/** GET /user/address */
export function useAddresses() {
  return useQuery({
    queryKey: ADDRESS_KEY,
    queryFn: () => addressService.list(),
  });
}

/**
 * One factory — the three writes differ only in the call they make.
 *
 * `fallback` is the toast shown when the API sends no message of its own; when
 * it does ("Address Added successfully"), that wins, because the backend words
 * these better than a generic string and localises them with `?lang=`.
 *
 * None of them write into the cache. The API answers with a message, not the
 * updated row, so re-reading the list is the only honest way to show what was
 * saved — and it is one small request.
 */
function useAddressMutation<TArg>(run: (arg: TArg) => Promise<unknown>, fallback: string) {
  const qc = useQueryClient();
  return useMutation<unknown, unknown, TArg>({
    mutationFn: run,
    onSuccess: (res) => {
      toast.success(getApiSuccessMessage(res, fallback));
      qc.invalidateQueries({ queryKey: ADDRESS_KEY });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

/** POST /user/address/store */
export function useCreateAddress(message: string) {
  return useAddressMutation<AddressRequest>((p) => addressService.create(p), message);
}

/** POST /user/address/update */
export function useUpdateAddress(message: string) {
  return useAddressMutation<{ id: number | string; payload: AddressRequest }>(
    ({ id, payload }) => addressService.update(id, payload),
    message,
  );
}

/** POST /user/address/delete */
export function useDeleteAddress(message: string) {
  return useAddressMutation<number | string>((id) => addressService.remove(id), message);
}
