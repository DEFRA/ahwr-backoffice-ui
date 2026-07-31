import { getClaims } from "../../../../../app/api/claims.js";

export const triggerClaimsAdvancedSearchWithNoFilters = () =>
  getClaims({ searchText: "", searchType: "" }, 20, 0, undefined, { error: jest.fn() });
