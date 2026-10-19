/**
 * Where a service booking lives. A module of its own so the header's cart
 * drawer can link to the checkout without importing the checkout's hooks into
 * every page of the site.
 */
export const SERVICE_ROUTES = {
  details: (id: number) => `/services/details?id=${id}`,
  checkout: "/services/checkout",
  history: "/dashboard/history/service",
};
