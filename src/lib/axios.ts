import axios from "axios";
import { env } from "@/config/env";
import { TOKEN_KEY, clearAuthState } from "@/lib/authState";

/** Re-exported so the existing `from "@/lib/axios"` imports keep working. */
export { TOKEN_KEY };

const commonHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/* ──────────────────────────────────────────────────────────────────────────
 * publicApi — no auth, no interceptors (login, register, …)
 * ────────────────────────────────────────────────────────────────────────── */
export const publicApi = axios.create({
  baseURL: env.apiUrl,
  headers: commonHeaders,
});

/* ──────────────────────────────────────────────────────────────────────────
 * privateApi — auto-attaches the bearer token; handles 401
 * ────────────────────────────────────────────────────────────────────────── */
export const privateApi = axios.create({
  baseURL: env.apiUrl,
  headers: commonHeaders,
});

/* Request: attach Authorization from localStorage (SSR-safe). */
privateApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* Response: on 401, clear the token and bounce to /login. */
privateApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearAuthState();
      // A hard navigation on purpose: this runs outside React (an axios
      // interceptor), so there is no router to call, and wiping the whole JS
      // state on a dead session is the safer outcome anyway.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
