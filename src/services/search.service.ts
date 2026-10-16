import { publicApi } from "@/lib/axios";

/**
 * The public service search.
 *
 *   GET /service/search-get   the states (and their cities) the search form offers
 *   GET /service/search       ?state=&city=&search= — the results
 *
 * ⚠️ `search-get` hangs ONE `city` object (or `null`) off each state in the
 * collection's sample, though a state can have several cities. The type takes
 * either an object or an array, and the hook normalises both into a list, so
 * the form keeps working whichever way the backend settles.
 */

export interface SearchCity {
  id: number;
  state_id?: number;
  name: string;
  slug?: string;
  status?: number;
}

export interface SearchState {
  id: number;
  name: string;
  slug?: string;
  status?: number;
  city?: SearchCity | SearchCity[] | null;
}

export interface SearchLocationsData {
  state?: SearchState[];
}

export const searchService = {
  /** GET /service/search-get — public, no auth. */
  async getLocations(): Promise<{ data: SearchLocationsData }> {
    const res = await publicApi.get("/service/search-get");
    return res.data;
  },
};

export default searchService;
