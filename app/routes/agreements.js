import Joi from "joi";
import { permissions } from "../auth/permissions.js";
import { config } from "../config/index.js";
import { setAppSearch, getAppSearch } from "../session/index.js";
import { sessionKeys } from "../session/keys.js";
import { viewModel } from "./models/application-list.js";
import { searchValidation } from "../lib/search-validation.js";
import { extractDateParts } from "./utils/date-filter.js";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { AGREEMENT_FLAG, AGREEMENT_STATUS, AGREEMENT_TYPE } from "../constants/index.js";
import { StatusCodes } from "http-status-codes";

const { administrator, processor, user, recommender, authoriser } = permissions;
const { displayPageSize } = config;
const viewTemplate = "agreements";
const currentPath = `/${viewTemplate}`;
const emptyDateParts = { day: "", month: "", year: "" };

export const agreementsRoutes = [
  {
    method: "GET",
    path: currentPath,
    options: {
      auth: {
        scope: [administrator, processor, user, recommender, authoriser],
      },
      validate: {
        query: Joi.object({
          page: Joi.number().greater(0).default(1),
          limit: Joi.number().greater(0).default(displayPageSize),
        }),
      },
      handler: async (request, h) => {
        await generateNewCrumb(request, h);
        const viewModelDetails = await viewModel(request);
        return h.view(viewTemplate, viewModelDetails);
      },
    },
  },
  {
    method: "GET",
    path: `${currentPath}/clear`,
    options: {
      auth: {
        scope: [administrator, processor, user, recommender, authoriser],
      },
      handler: async (request, h) => {
        setAppSearch(request, sessionKeys.appSearch.searchText, "");
        setAppSearch(request, sessionKeys.appSearch.searchType, "");
        setAppSearch(request, sessionKeys.appSearch.status, AGREEMENT_STATUS.ALL);
        setAppSearch(request, sessionKeys.appSearch.flag, AGREEMENT_FLAG.ALL);
        setAppSearch(request, sessionKeys.appSearch.agreementType, AGREEMENT_TYPE.ALL);
        setAppSearch(request, sessionKeys.appSearch.dateFrom, emptyDateParts);
        setAppSearch(request, sessionKeys.appSearch.dateTo, emptyDateParts);
        const viewModelDetails = await viewModel(request);
        return h.view(viewTemplate, viewModelDetails);
      },
    },
  },
  {
    method: "GET",
    path: `${currentPath}/remove/{status}`,
    options: {
      auth: {
        scope: [administrator, processor, user, recommender, authoriser],
      },
      validate: {
        params: Joi.object({
          status: Joi.string(),
        }),
      },
      handler: async (request, h) => {
        let status = getAppSearch(request, sessionKeys.appSearch.status);
        status = status.filter((s) => s !== request.params.status);
        setAppSearch(request, sessionKeys.appSearch.status, status);
        const viewModelDetails = await viewModel(request);
        return h.view(viewTemplate, viewModelDetails);
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
        query: Joi.object({
          page: Joi.number().greater(0).default(1),
          limit: Joi.number().greater(0).default(displayPageSize),
        }),
      },
      handler: async (request, h) => {
        try {
          let agreementType, status, flag;

          // Basic search and advanced search are mutually exclusive: a basic
          // search filters by text only, an advanced search by agreement type only.
          const isAdvancedSearch = request.payload.submit === "advancedSearch";

          if (isAdvancedSearch) {
            agreementType = request.payload.agreementType ?? AGREEMENT_TYPE.ALL;
            status = request.payload.status ?? AGREEMENT_STATUS.ALL;
            flag = request.payload.flag ?? AGREEMENT_FLAG.ALL;
          } else {
            agreementType = AGREEMENT_TYPE.ALL;
            status = AGREEMENT_STATUS.ALL;
            flag = AGREEMENT_FLAG.ALL;
          }

          setAppSearch(request, sessionKeys.appSearch.agreementType, agreementType);
          setAppSearch(request, sessionKeys.appSearch.status, status);
          setAppSearch(request, sessionKeys.appSearch.flag, flag);

          const dateFrom = isAdvancedSearch
            ? extractDateParts(request.payload, "dateFrom")
            : emptyDateParts;
          const dateTo = isAdvancedSearch
            ? extractDateParts(request.payload, "dateTo")
            : emptyDateParts;
          setAppSearch(request, sessionKeys.appSearch.dateFrom, dateFrom);
          setAppSearch(request, sessionKeys.appSearch.dateTo, dateTo);

          const { searchText, searchType } = isAdvancedSearch
            ? { searchText: "", searchType: "" }
            : searchValidation(request.payload.searchText);
          setAppSearch(request, sessionKeys.appSearch.searchText, searchText ?? "");
          setAppSearch(request, sessionKeys.appSearch.searchType, searchType ?? "");
          const viewModelDetails = await viewModel(request, 1);
          return h.view(viewTemplate, viewModelDetails);
        } catch (err) {
          return h
            .view(viewTemplate, { ...request.payload, error: err })
            .code(StatusCodes.BAD_REQUEST)
            .takeover();
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
        params: Joi.object({
          field: Joi.string(),
          direction: Joi.string(),
        }),
      },
      handler: async (request, _h) => {
        request.params.direction = request.params.direction !== "descending" ? "DESC" : "ASC";
        setAppSearch(request, sessionKeys.appSearch.sort, request.params);
        return 1; // NOSONAR
      },
    },
  },
];
