"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { addressService } from "@/services/address.service";
import { getApiErrorMessage } from "@/hooks/useAuth";
import type { AddressRequest } from "@/schemas/address.schema";

const KEY = ["addresses"] as const;

export function useAddresses() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => addressService.list(),
    /* The store is local, so there is nothing to go stale against and no
       network to re-hit on every focus. */
    staleTime: Infinity,
  });
}

/** One mutation factory — the four operations differ only in call and message. */
function useAddressMutation<TArg>(
  run: (arg: TArg) => Promise<unknown>,
  successKey: string,
) {
  const qc = useQueryClient();
  return useMutation<unknown, unknown, TArg>({
    mutationFn: run,
    onSuccess: () => {
      toast.success(successKey);
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

export function useCreateAddress(message: string) {
  return useAddressMutation<AddressRequest>((p) => addressService.create(p), message);
}

export function useUpdateAddress(message: string) {
  return useAddressMutation<{ id: string; payload: AddressRequest }>(
    ({ id, payload }) => addressService.update(id, payload),
    message,
  );
}

export function useDeleteAddress(message: string) {
  return useAddressMutation<string>((id) => addressService.remove(id), message);
}

export function useSetDefaultAddress(message: string) {
  return useAddressMutation<string>((id) => addressService.setDefault(id), message);
}
