"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { searchService, type SearchCity, type SearchLocationsData } from "@/services/search.service";
import type { ServiceSearchRequest } from "@/schemas/search.schema";

export interface SearchLocation {
  id: string;
  name: string;
  cities: { id: string; name: string }[];
}

/** One city object, a list, or `null` — always a list out. See the service. */
function citiesOf(city: SearchCity | SearchCity[] | null | undefined) {
  const list = Array.isArray(city) ? city : city ? [city] : [];
  return list.map((c) => ({ id: String(c.id), name: c.name }));
}

function toLocations(res: { data: SearchLocationsData }): SearchLocation[] {
  return (res.data?.state ?? []).map((s) => ({
    id: String(s.id),
    name: s.name,
    cities: citiesOf(s.city),
  }));
}

/**
 * GET /service/search-get — the states and cities the search form offers.
 * Admin-managed and the same for everyone, so it is cached like the settings.
 */
export function useSearchLocations() {
  return useQuery({
    queryKey: ["search-locations"],
    queryFn: () => searchService.getLocations(),
    select: toLocations,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Submitting the search is a navigation, not a request: the results live on
 * `/services`, keyed by the same `state` / `city` / `search` params the API's
 * `GET /service/search` takes, so the URL is shareable and Back works. Empty
 * fields are left off rather than sent as `state=`.
 */
export function useServiceSearchSubmit() {
  const router = useRouter();

  return (values: ServiceSearchRequest) => {
    const params = new URLSearchParams();
    if (values.state) params.set("state", values.state);
    if (values.city) params.set("city", values.city);
    const search = values.search.trim();
    if (search) params.set("search", search);

    const query = params.toString();
    router.push(query ? `/services?${query}` : "/services");
  };
}
