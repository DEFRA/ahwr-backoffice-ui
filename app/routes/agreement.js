import joi from "joi";
import boom from "@hapi/boom";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { permissions } from "../auth/permissions.js";
import { getApplication } from "../api/applications.js";
import { formattedDateToUk, upperFirstLetter } from "../lib/display-helper.js";
import { getClaimSearch, setClaimSearch } from "../session/index.js";
import { sessionKeys } from "../session/keys.js";
import { getContactHistory, displayContactHistory } from "../api/contact-history.js";
import { getClaims } from "../api/claims.js";
import { getClaimTableHeader, getClaimTableRows } from "./models/claim-list.js";
import { FLAG_EMOJI } from "./utils/ui-constants.js";
import { getHerdBreakdown, getSiteBreakdown } from "../lib/get-claim-breakdown.js";
import { getClaimViewStates } from "./utils/get-claim-view-states.js";
import { getErrorMessagesByKey } from "./utils/get-error-messages-by-key.js";
import { getStyleClassByStatus } from "../constants/status.js";
import { getScheme, POULTRY_SCHEME } from "ffc-ahwr-common-library";

const { administrator, authoriser, processor, recommender, user } = permissions;
const pageUrl = "/agreement/{reference}/claims";
const getBackLink = (page, claimReference, returnPage) => {
  return returnPage === "view-claim"
    ? `/view-claim/${claimReference}?page=${page}`
    : `/agreements?page=${page}`;
};

const buildAgreementSummaryDetails = (
  application,
  {
    applicationReference,
    flaggedText,
    isFlagged,
    contactHistoryDetails,
    updateEligiblePiiRedactionAction,
  },
) => {
  const { organisation } = application;
  return [
    {
      field: "Agreement number",
      newValue: `${applicationReference}${flaggedText}`,
      oldValue: null,
      flagged: isFlagged,
    },
    {
      field: "Agreement date",
      newValue: formattedDateToUk(application.createdAt),
      oldValue: null,
    },
    {
      field: "Agreement holder",
      newValue: organisation.farmerName,
      oldValue: contactHistoryDetails.farmerName,
    },
    {
      field: "Agreement holder email",
      newValue: organisation.email,
      oldValue: contactHistoryDetails.email,
    },
    { field: "SBI number", newValue: organisation.sbi, oldValue: null },
    {
      field: "Address",
      newValue: organisation.address,
      oldValue: contactHistoryDetails.address,
    },
    {
      field: "Business email",
      newValue: organisation.orgEmail,
      oldValue: contactHistoryDetails.orgEmail,
    },
    {
      field: "Flagged",
      newValue: application.flags.length > 0 ? "Yes" : "No",
      oldValue: null,
    },
    {
      field: "Eligible for automated data redaction",
      newValue: application.eligiblePiiRedaction ? "Yes" : "No",
      oldValue: null,
      change: updateEligiblePiiRedactionAction,
    },
  ].filter((row) => row.newValue);
};

const buildAgreementClaimsTable = async (request, applicationReference, page) => {
  const sortField = getClaimSearch(request, sessionKeys.claimSearch.sort) ?? undefined;
  const showSBI = false;
  const dataURLPrefix = `/agreement/${applicationReference}/`;
  const header = getClaimTableHeader(sortField, dataURLPrefix, showSBI);

  const { claims, total } = await getClaims(
    "appRef",
    applicationReference,
    undefined,
    30,
    0,
    sortField,
    request.logger,
  );
  const rows = getClaimTableRows(claims, page, "agreement", showSBI);

  return { header, rows, total, claims };
};

export const buildAgreement = async (
  request,
  h,
  { reference, page, returnPage, backLinkReference, formFlags, errors = [] },
) => {
  const applicationReference = reference;

  await generateNewCrumb(request, h);
  const application = await getApplication(applicationReference, request.logger);
  const contactHistory = await getContactHistory(applicationReference, request.logger);
  const contactHistoryDetails = displayContactHistory(contactHistory);

  if (!application) {
    throw boom.badRequest();
  }

  const { organisation, status } = application;
  const isFlagged = application.flags.length > 0;
  const flaggedText = isFlagged ? ` ${FLAG_EMOJI}` : "";
  const isRedacted = application.redacted;

  const { updateEligiblePiiRedactionAction, updateEligiblePiiRedactionForm } = !isRedacted
    ? getClaimViewStates(request, application.status, null, formFlags)
    : {};

  const applicationSummaryDetails = buildAgreementSummaryDetails(application, {
    applicationReference,
    flaggedText,
    isFlagged,
    contactHistoryDetails,
    updateEligiblePiiRedactionAction,
  });

  const { header, rows, total, claims } = await buildAgreementClaimsTable(
    request,
    applicationReference,
    page,
  );

  const errorMessages = getErrorMessagesByKey(errors);

  const statusLabel = upperFirstLetter(status.toLowerCase().replaceAll("_", " "));
  const statusClass = getStyleClassByStatus(status);

  const scheme = getScheme(applicationReference);
  const claimsBreakdown =
    scheme === POULTRY_SCHEME ? getSiteBreakdown(claims) : getHerdBreakdown(claims);

  return h.view("agreement", {
    backLink: getBackLink(page, backLinkReference, returnPage),
    businessName: organisation.name,
    applicationSummaryDetails,
    claimsTotal: total,
    header,
    rows,
    ...claimsBreakdown,
    updateEligiblePiiRedactionUrl: `/agreement/${applicationReference}/claims?page=${page}&updateEligiblePiiRedaction=true`,
    updateEligiblePiiRedactionAction,
    updateEligiblePiiRedactionForm,
    eligiblePiiRedaction: application.eligiblePiiRedaction,
    reference: application.reference,
    page,
    errorMessages,
    errors,
    applicationStatus: {
      statusLabel,
      statusClass,
    },
  });
};

export const agreementRoutes = [
  {
    method: "GET",
    path: pageUrl,
    options: {
      auth: {
        scope: [administrator, authoriser, processor, recommender, user],
      },
      validate: {
        params: joi.object({
          reference: joi.string(),
        }),
        query: joi.object({
          reference: joi.string(),
          page: joi.number().greater(0).default(1),
          returnPage: joi.string(),
          updateEligiblePiiRedaction: joi.bool().default(false),
          errors: joi.any().strip(),
        }),
      },
      handler: async (request, h) => {
        return buildAgreement(request, h, {
          reference: request.params.reference,
          page: request.query.page,
          returnPage: request.query.returnPage,
          backLinkReference: request.query.reference,
          formFlags: request.query,
          errors: [],
        });
      },
    },
  },
  {
    method: "GET",
    path: `${pageUrl}/sort/{field}/{direction}`,
    options: {
      auth: {
        scope: [administrator, processor, user, recommender, authoriser],
      },
      validate: {
        params: joi.object({
          reference: joi.string(),
          field: joi.string(),
          direction: joi.string(),
        }),
      },
      handler: async (request, _h) => {
        request.params.direction = request.params.direction !== "descending" ? "DESC" : "ASC";
        setClaimSearch(request, sessionKeys.claimSearch.sort, request.params);
        return 1; // NOSONAR
      },
    },
  },
];
