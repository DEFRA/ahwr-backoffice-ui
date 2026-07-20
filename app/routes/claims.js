import joi from "joi";
import { getClaimSearch, setClaimSearch } from "../session/index.js";
import { sessionKeys } from "../session/keys.js";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { config } from "../config/index.js";
import { getClaims } from "../api/claims.js";
import { getPagination, getPagingData } from "../pagination.js";
import { searchValidation } from "../lib/search-validation.js";
import { getClaimTableHeader, getClaimTableRows } from "./models/claim-list.js";
import { getAgreementTypeOptions } from "./utils/get-agreement-type-options.js";
import { permissions } from "../auth/permissions.js";
import { AGREEMENT_TYPE } from "../constants/index.js";
import { StatusCodes } from "http-status-codes";
import { getClaimStatusOptions, ALL_STATUS } from "./utils/get-claim-status-options.js";

const { administrator, authoriser, processor, recommender, user } = permissions;
const { displayPageSize } = config;
const { claimSearch } = sessionKeys;
const viewTemplate = "claims";
const currentPath = `/${viewTemplate}`;

// claims basic search supports claim number and SBI only; every other term returns no results
const SUPPORTED_SEARCH_TYPES = new Set(["ref", "sbi", "reset"]);

const getViewData = async (request) => {
  const { page } = request.query;
  const returnPage = viewTemplate;
  const { limit, offset } = getPagination(page);

  const searchText = getClaimSearch(request, claimSearch.searchText);
  // an empty/absent stored type means no basic-search term is active; treat it as the show-all "reset" type
  const searchType = getClaimSearch(request, claimSearch.searchType) || "reset";
  const sort = getClaimSearch(request, claimSearch.sort);
  const agreementType = getClaimSearch(request, claimSearch.agreementType) ?? AGREEMENT_TYPE.ALL;
  const status = getClaimSearch(request, claimSearch.status) ?? ALL_STATUS;

  const header = getClaimTableHeader(sort);
  const agreementTypeOptions = getAgreementTypeOptions(agreementType);
  const statusOptions = getClaimStatusOptions(status);

  const emptyViewData = () => ({
    searchText,
    header,
    rows: [],
    ...getPagingData(0, limit, request.query),
    error: "No claims found.",
    total: 0,
    agreementTypeOptions,
    statusOptions,
  });

  if (!SUPPORTED_SEARCH_TYPES.has(searchType)) {
    return emptyViewData();
  }

  const { claims, total } = await getClaims(
    { searchText, searchType, agreementType, status },
    limit,
    offset,
    sort,
    request.logger,
  );

  if (total === 0) {
    return emptyViewData();
  }

  const rows = getClaimTableRows(claims, page, returnPage);
  const { previous, next, pages } = getPagingData(total, limit, request.query);

  return {
    searchText,
    header,
    rows,
    previous,
    next,
    pages,
    error: null,
    total,
    agreementTypeOptions,
    statusOptions,
  };
};

export const claimsRoutes = [
  {
    method: "GET",
    path: currentPath,
    options: {
      auth: {
        scope: [administrator, authoriser, processor, recommender, user],
      },
      validate: {
        query: joi.object({
          page: joi.number().greater(0).default(1),
          limit: joi.number().greater(0).default(displayPageSize),
        }),
      },
      handler: async (request, h) => {
        try {
          await generateNewCrumb(request, h);
          const viewData = await getViewData(request);
          return h.view("claims", viewData);
        } catch (err) {
          request.logger.error({ err });
          throw err;
        }
      },
    },
  },
  {
    method: "GET",
    path: `${currentPath}/sort/{field}/{direction}`,
    options: {
      auth: {
        scope: [administrator, processor, user, recommender, authoriser],
      },
      validate: {
        params: joi.object({
          field: joi.string(),
          direction: joi.string(),
        }),
      },
      handler: async (request) => {
        request.params.direction = request.params.direction !== "descending" ? "DESC" : "ASC";
        setClaimSearch(request, claimSearch.sort, request.params);
        return 1; // NOSONAR
      },
    },
  },
  {
    method: "GET",
    path: `${currentPath}/clear`,
    options: {
      auth: {
        scope: [administrator, authoriser, processor, recommender, user],
      },
      validate: {
        query: joi.object({
          page: joi.number().greater(0).default(1),
          limit: joi.number().greater(0).default(displayPageSize),
        }),
      },
      handler: async (request, h) => {
        try {
          await generateNewCrumb(request, h);
          setClaimSearch(request, claimSearch.searchText, "");
          setClaimSearch(request, claimSearch.searchType, "");
          setClaimSearch(request, claimSearch.agreementType, AGREEMENT_TYPE.ALL);
          setClaimSearch(request, claimSearch.status, ALL_STATUS);
          const viewData = await getViewData(request);
          return h.view(viewTemplate, viewData);
        } catch (err) {
          request.logger.error({ err });
          throw err;
        }
      },
    },
  },
  {
    method: "POST",
    path: `${currentPath}`,
    options: {
      auth: {
        scope: [administrator, processor, user, recommender, authoriser],
      },
      validate: {
        query: joi.object({
          page: joi.number().greater(0).default(1),
          limit: joi.number().greater(0).default(displayPageSize),
        }),
      },
      handler: async (request, h) => {
        try {
          let agreementType, status;

          const isAdvancedSearch = request.payload?.submit === "advancedSearch";
          if (isAdvancedSearch) {
            agreementType = request.payload.agreementType ?? AGREEMENT_TYPE.ALL;
            status = request.payload.status ?? ALL_STATUS;
          } else {
            agreementType = AGREEMENT_TYPE.ALL;
            status = ALL_STATUS;
          }

          setClaimSearch(request, claimSearch.agreementType, agreementType);
          setClaimSearch(request, claimSearch.status, status);

          const { searchText, searchType } = isAdvancedSearch
            ? { searchText: "", searchType: "" }
            : searchValidation(request.payload?.searchText);
          setClaimSearch(request, claimSearch.searchText, searchText ?? "");
          setClaimSearch(request, claimSearch.searchType, searchType ?? "");

          const viewData = await getViewData(request);
          return h.view(viewTemplate, viewData);
        } catch (error) {
          request.logger.error({ error });

          return h
            .view(viewTemplate, { ...request.payload, error })
            .code(StatusCodes.BAD_REQUEST)
            .takeover();
        }
      },
    },
  },
];
