import { sessionKeys } from "../../session/keys.js";
import { getApplications } from "../../api/applications.js";
import { getPagination, getPagingData } from "../../pagination.js";
import { getAppSearch } from "../../session/index.js";
import { getStyleClassByStatus } from "../../constants/status.js";
import { upperFirstLetter } from "../../lib/display-helper.js";
import { FLAG_EMOJI } from "../utils/ui-constants.js";
import { config } from "../../config/index.js";
import { buildDateFilter, resolveDateRange } from "../utils/date-filter.js";
import { AGREEMENT_FLAG, AGREEMENT_STATUS, AGREEMENT_TYPE } from "../../constants/index.js";
import {
  getAgreementTypeOptions,
  getStatusOptions,
  getFlagOptions,
} from "../utils/get-agreement-type-options.js";

const { serviceUri } = config;

// date and status are retired from agreements basic search; recognise them and return no results
const RETIRED_SEARCH_TYPES = ["date", "status"];

const emptyModel = ({
  searchText,
  agreementTypeOptions,
  agreementDateFrom,
  agreementDateTo,
  statusOptions,
  flagOptions,
}) => ({
  applications: [],
  total: 0,
  error: "No agreements found.",
  searchText,
  agreementTypeOptions,
  agreementDateFrom,
  agreementDateTo,
  statusOptions,
  flagOptions,
});

export const viewModel = (request, page) => {
  return (async () => {
    return { model: await createModel(request, page) };
  })();
};

export const getApplicationTableHeader = (sortField) => {
  const direction = sortField?.direction === "DESC" ? "descending" : "ascending";
  const agreementDateTitle = "Agreement date";
  const sort = sortField ? sortField.field : "";
  const headerColumns = [
    {
      text: "Agreement number",
      attributes: {
        "aria-sort": sort === "Reference" ? direction : "none",
        "data-url": "/agreements/sort/Reference",
      },
      classes: "col-9",
    },
    {
      html: `<span>Flagged ${FLAG_EMOJI}</span>`,
      classes: "col-9",
    },
    {
      text: "Organisation",
      attributes: {
        "aria-sort": sort === "Organisation" ? direction : "none",
        "data-url": "/agreements/sort/Organisation",
      },
      classes: "col-25",
    },
    {
      text: "SBI number",
      attributes: {
        "aria-sort": sort === "SBI" ? direction : "none",
        "data-url": "/agreements/sort/SBI",
      },
      classes: "col-6",
    },
    {
      text: agreementDateTitle,
      attributes: {
        "aria-sort": sort === "Apply date" ? direction : "none",
        "data-url": "/agreements/sort/Apply date",
      },
      format: "date",
      classes: "col-6",
    },
    {
      text: "Status",
      attributes: {
        "aria-sort": sort === "Status" ? direction : "none",
        "data-url": "/agreements/sort/Status",
      },
      classes: "col-6",
    },
  ];

  return headerColumns;
};

const buildApplicationList = (applications, page) => {
  return applications.map((app) => {
    const statusClass = getStyleClassByStatus(app.status);
    const row = [
      {
        html:
          app.type === "EE"
            ? `<a href="${serviceUri}/agreement/${app.reference}/claims?page=${page}" data-sort-value="${app.reference}">${app.reference}</a>`
            : `<a href="${serviceUri}/view-agreement/${app.reference}?page=${page}" data-sort-value="${app.reference}">${app.reference}</a>`,
      },
      {
        html: app.flags.length > 0 ? `<span>Yes ${FLAG_EMOJI}</span>` : "",
      },
      {
        text: app.organisation?.name,
        attributes: {
          "data-sort-value": `${app.data?.organisation?.name}`,
        },
      },
      {
        text: app.organisation?.sbi,
        attributes: {
          "data-sort-value": app.data?.organisation?.sbi,
        },
      },
      {
        text: new Date(app.createdAt).toLocaleDateString("en-GB"),
        format: "date",
        attributes: {
          "data-sort-value": app.createdAt,
        },
      },
      {
        html: `<span class="app-long-tag"><span class="govuk-tag ${statusClass}">${upperFirstLetter(app.status.toLowerCase()).replaceAll("_", " ")}</span></span>`,
        attributes: {
          "data-sort-value": `${app.status}`,
        },
      },
    ];

    if (app.flags.length) {
      return row.map((rowItem) => ({
        ...rowItem,
        classes: "flagged-item",
      }));
    }

    return row;
  });
};

export async function createModel(request, page) {
  page = page ?? request.query.page ?? 1;
  const { limit, offset } = getPagination(page);
  const searchText = getAppSearch(request, sessionKeys.appSearch.searchText);
  const searchType = getAppSearch(request, sessionKeys.appSearch.searchType);
  const agreementType =
    getAppSearch(request, sessionKeys.appSearch.agreementType) ?? AGREEMENT_TYPE.ALL;
  const status = getAppSearch(request, sessionKeys.appSearch.status) ?? AGREEMENT_STATUS.ALL;
  const flag = getAppSearch(request, sessionKeys.appSearch.flag) ?? AGREEMENT_FLAG.ALL;

  const agreementTypeOptions = getAgreementTypeOptions(agreementType);
  const statusOptions = getStatusOptions(status);
  const flagOptions = getFlagOptions(flag);

  const dateFromFilter = buildDateFilter(getAppSearch(request, sessionKeys.appSearch.dateFrom));
  const dateToFilter = buildDateFilter(getAppSearch(request, sessionKeys.appSearch.dateTo), {
    endOfDay: true,
  });

  if (RETIRED_SEARCH_TYPES.includes(searchType)) {
    return emptyModel({
      searchText,
      agreementTypeOptions,
      agreementDateFrom: dateFromFilter.items,
      agreementDateTo: dateToFilter.items,
      statusOptions,
      flagOptions,
    });
  }

  const sortField = getAppSearch(request, sessionKeys.appSearch.sort) ?? undefined;
  const { dateFrom, dateTo } = resolveDateRange(dateFromFilter, dateToFilter);

  const apps = await getApplications(
    {
      searchText,
      searchType,
      status,
      flag,
      agreementType,
      dateFrom,
      dateTo,
    },
    limit,
    offset,
    sortField,
    request.logger,
  );

  if (apps.total > 0) {
    const applications = buildApplicationList(apps.applications, page);
    const pagingData = getPagingData(apps.total ?? 0, limit, request.query);

    return {
      applications,
      total: apps.total,
      header: getApplicationTableHeader(getAppSearch(request, sessionKeys.appSearch.sort)),
      ...pagingData,
      searchText,
      agreementTypeOptions,
      agreementDateFrom: dateFromFilter.items,
      agreementDateTo: dateToFilter.items,
      statusOptions,
      flagOptions,
    };
  }

  return emptyModel({
    searchText,
    agreementTypeOptions,
    agreementDateFrom: dateFromFilter.items,
    agreementDateTo: dateToFilter.items,
    statusOptions,
    flagOptions,
  });
}
