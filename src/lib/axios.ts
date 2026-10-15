import axios, { type AxiosInstance } from "axios";
import { env } from "@/config/env";
import { readLang } from "@/lib/langState";
import { TOKEN_KEY, VENDOR_TOKEN_KEY, readToken, clearAuthState, type AuthRole } from "@/lib/authState";

/** Re-exported so the existing `from "@/lib/axios"` imports keep working. */
export { TOKEN_KEY, VENDOR_TOKEN_KEY };

const commonHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/*
 * Four instances, not two — but still only two *kinds*.
 *
 * The vendor API is a different root with a different Laravel guard
 * (`…/api/vendor/v1/vendors/*` against `…/api/v1/user/*`), so it needs its own
 * baseURL, its own token and its own 401 landing page. Everything else about
 * the pair is identical, which is why they are built by one factory here rather
 * than hand-rolled per feature: §11.3's "never create a third instance ad-hoc"
 * is about features, and this is the one sanctioned place for a second API.
 */
function createInstance(baseURL: string): AxiosInstance {
  return axios.create({ baseURL, headers: commonHeaders });
}

/**
 * The customer API localizes its messages off `?lang=`, and 35 of its 43
 * endpoints take it — so it goes on every request instead of being remembered
 * per call site. A caller that passes its own `lang` wins.
 *
 * The vendor API takes no `lang` at all (0 of 43 endpoints), so this is not
 * applied there.
 */
function withLang(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.request.use((config) => {
    config.params = { lang: readLang(), ...(config.params ?? {}) };
    return config;
  });
  return instance;
}

/** Attaches the role's bearer token, and bounces a dead session to `loginPath`. */
function withAuth(instance: AxiosInstance, role: AuthRole, loginPath: string): AxiosInstance {
  instance.interceptors.request.use((config) => {
    const token = readToken(role);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && typeof window !== "undefined") {
        clearAuthState(role);
        // A hard navigation on purpose: this runs outside React (an axios
        // interceptor), so there is no router to call, and wiping the whole JS
        // state on a dead session is the safer outcome anyway.
        window.location.href = loginPath;
      }
      return Promise.reject(error);
    },
  );
  return instance;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Customer API — …/api/v1
 * ────────────────────────────────────────────────────────────────────────── */

/** No auth (login, register, forgot, public catalogue). */
export const publicApi = withLang(createInstance(env.apiUrl));

/** Signed-in customer. */
export const privateApi = withAuth(withLang(createInstance(env.apiUrl)), "user", "/login");

/* ──────────────────────────────────────────────────────────────────────────
 * Vendor API — …/api/vendor/v1
 * ────────────────────────────────────────────────────────────────────────── */

/** No auth (vendor login, register, forgot). */
export const vendorPublicApi = createInstance(env.vendorApiUrl);

/** Signed-in vendor. */
export const vendorPrivateApi = withAuth(
  createInstance(env.vendorApiUrl),
  "vendor",
  "/vendors/login",
);

/** The right pair for a role — lets one service body serve both sides. */
export function apiFor(role: AuthRole) {
  return role === "vendor"
    ? { publicApi: vendorPublicApi, privateApi: vendorPrivateApi }
    : { publicApi, privateApi };
}
