import type { AddressRequest, SavedAddress } from "@/schemas/address.schema";
import { addressRequestSchema } from "@/schemas/address.schema";

/**
 * Saved addresses.
 *
 * There is no endpoint for these yet, so this stands in with `localStorage`.
 * It is shaped exactly like the axios services beside it — every method is
 * async and returns the same envelope a Laravel route would — so when
 * `/user/address` lands, THIS FILE is the only one that changes: the hooks,
 * the query keys and the screen all stay as they are.
 *
 * Unlike `homeData`, a constant array will not do: these are user-owned records
 * that have to survive a reload.
 */
export const ADDRESS_STORAGE_KEY = "handiman_addresses";

function read(): SavedAddress[] {
  try {
    const raw = window.localStorage.getItem(ADDRESS_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as SavedAddress[]) : [];
  } catch {
    /* Unparseable or unavailable storage reads as empty rather than throwing —
       a corrupt entry should not take the whole screen down. */
    return [];
  }
}

function write(rows: SavedAddress[]) {
  try {
    window.localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // Private mode / quota. The in-memory result still stands for this session.
  }
}

/** Exactly one row may be default; setting one clears the rest. */
function normaliseDefault(rows: SavedAddress[], preferId?: string): SavedAddress[] {
  const winner = preferId ?? rows.find((r) => r.isDefault)?.id ?? rows[0]?.id;
  return rows.map((r) => ({ ...r, isDefault: r.id === winner }));
}

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `addr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const addressService = {
  async list(): Promise<{ data: SavedAddress[] }> {
    return { data: read() };
  },

  async create(payload: AddressRequest): Promise<{ data: SavedAddress }> {
    const body = addressRequestSchema.parse(payload);
    const row: SavedAddress = { ...body, id: newId() };
    const rows = [...read(), row];
    /* First address saved is the default whatever the form said — an account
       with addresses and no default has nothing to pre-fill a booking with. */
    write(normaliseDefault(rows, body.isDefault || rows.length === 1 ? row.id : undefined));
    return { data: row };
  },

  async update(id: string, payload: AddressRequest): Promise<{ data: SavedAddress }> {
    const body = addressRequestSchema.parse(payload);
    const rows = read().map((r) => (r.id === id ? { ...r, ...body, id } : r));
    write(normaliseDefault(rows, body.isDefault ? id : undefined));
    return { data: { ...body, id } };
  },

  async remove(id: string): Promise<{ data: { id: string } }> {
    write(normaliseDefault(read().filter((r) => r.id !== id)));
    return { data: { id } };
  },

  async setDefault(id: string): Promise<{ data: { id: string } }> {
    write(normaliseDefault(read(), id));
    return { data: { id } };
  },
};

export default addressService;
