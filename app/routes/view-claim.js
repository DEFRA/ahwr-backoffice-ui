import joi from "joi";
import { getClaim, getClaimHistory, getClaims } from "../api/claims.js";
import { getHistoryDetails } from "./models/application-history.js";
import { getStyleClassByStatus } from "../constants/status.js";
import { upperFirstLetter, formattedDateToUk } from "../lib/display-helper.js";
import { getScheme, POULTRY_SCHEME } from "ffc-ahwr-common-library";
import { permissions } from "../auth/permissions.js";
import { getCurrentStatusEvent } from "./utils/get-current-status-event.js";
import { getClaimViewStates } from "./utils/get-claim-view-states.js";
import { getErrorMessagesByKey } from "./utils/get-error-messages-by-key.js";
import { getHerdBreakdown, getSiteBreakdown } from "../lib/get-claim-breakdown.js";
import { getApplication } from "../api/applications.js";
import { buildKeyValueJson } from "../lib/row-helper.js";
import { prepareLivestockClaimDisplayRows } from "../lib/livestock-claim-rows.js";
import { getStatusUpdateOptions } from "../routes/utils/get-status-update-options.js";
import { preparePoultryClaimDisplayRows } from "../lib/poultry-claim-rows.js";

const { administrator, authoriser, processor, recommender, user } = permissions;

const backLink = (applicationReference, returnPage, page) => {
  return returnPage === "agreement"
    ? `/agreement/${applicationReference}/claims`
    : `/claims?page=${page}`;
};

const buildClaimApplicationSummary = (application, applicationReference) => {
  const { organisation } = application;
  return [
    buildKeyValueJson("Agreement number", applicationReference),
    buildKeyValueJson("Agreement date", formattedDateToUk(application.createdAt)),
    buildKeyValueJson("Agreement holder", organisation.farmerName),
    buildKeyValueJson("Agreement holder email", organisation.email),
    buildKeyValueJson("SBI number", organisation.sbi),
    buildKeyValueJson("Address", organisation.address.split(",").join(", ")),
    buildKeyValueJson("Business email", organisation.orgEmail),
    buildKeyValueJson("Flagged", application.flags.length > 0 ? "Yes" : "No"),
  ];
};

const prepareClaimSummaryRows = (scheme, claim, organisation, { page, returnPage }, viewStates) => {
  const { data, reference: claimReference, type, status: claimStatus, createdAt, herd } = claim;
  const rowPreparation =
    scheme === POULTRY_SCHEME ? preparePoultryClaimDisplayRows : prepareLivestockClaimDisplayRows;

  const rows = rowPreparation(
    data,
    { type, claimStatus, createdAt, organisation, herd },
    { claimReference, page, returnPage },
    {
      updateStatusAction: viewStates.updateStatusAction,
      updateDateOfVisitAction: viewStates.updateDateOfVisitAction,
      updateVetsNameAction: viewStates.updateVetsNameAction,
      updateVetRCVSNumberAction: viewStates.updateVetRCVSNumberAction,
    },
  );

  return rows.filter((row) => row?.value?.html);
};

const loadClaimsBreakdown = async (scheme, applicationReference, logger) => {
  const limit = 30;
  const offset = 0;
  const { claims } = await getClaims(
    "appRef",
    applicationReference,
    undefined,
    limit,
    offset,
    undefined,
    logger,
  );
  return scheme === POULTRY_SCHEME ? getSiteBreakdown(claims) : getHerdBreakdown(claims);
};

export const buildViewClaim = async (
  request,
  h,
  { reference, page, returnPage, formFlags, errors = [] },
) => {
  const claim = await getClaim(reference, request.logger);
  const { data, reference: claimReference, applicationReference, status: claimStatus } = claim;

  // TODO - look at removing setBindings here
  request.logger.setBindings({ applicationReference, claimReference });

  const application = await getApplication(applicationReference, request.logger);
  const { organisation } = application;

  // TODO - look at removing setBindings here
  request.logger.setBindings({ sbi: organisation.sbi });

  const { historyRecords } = await getClaimHistory(claimReference, request.logger);
  const currentStatusEvent = getCurrentStatusEvent(claim, historyRecords);

  const viewStates = application.redacted
    ? {}
    : getClaimViewStates(request, claim.status, currentStatusEvent, formFlags);

  const scheme = getScheme(applicationReference);

  return h.view("view-claim", {
    page,
    backLink: backLink(applicationReference, returnPage, page),
    returnPage,
    isFlagged: application.flags.length > 0,
    reference: claimReference,
    applicationReference,
    claimOrAgreement: "claim",
    dateOfVisit: data?.dateOfVisit,
    title: upperFirstLetter(organisation.name),
    claimSummaryDetails: prepareClaimSummaryRows(
      scheme,
      claim,
      organisation,
      { page, returnPage },
      viewStates,
    ),
    status: {
      normalType: upperFirstLetter(claim.status.replaceAll("_", " ").toLowerCase()),
      tagClass: getStyleClassByStatus(claim.status.replaceAll("_", " ")),
    },
    applicationSummaryDetails: buildClaimApplicationSummary(application, applicationReference),
    historyDetails: getHistoryDetails(historyRecords),
    statusOptions: getStatusUpdateOptions(claimStatus),
    errorMessages: getErrorMessagesByKey(errors),
    errors,
    ...viewStates,
    ...(await loadClaimsBreakdown(scheme, applicationReference, request.logger)),
  });
};

export const viewClaimRoute = {
  method: "get",
  path: "/view-claim/{reference}",
  options: {
    auth: { scope: [administrator, authoriser, processor, recommender, user] },
    validate: {
      params: joi.object({
        reference: joi.string().valid(),
      }),
      query: joi.object({
        page: joi.string().default(1).allow(null),
        returnPage: joi.string().optional().allow("").valid("agreement", "claims"),
        errors: joi.any().strip(),
        moveToInCheck: joi.bool().default(false),
        recommendToPay: joi.bool().default(false),
        recommendToReject: joi.bool().default(false),
        approve: joi.bool().default(false),
        reject: joi.bool().default(false),
        updateStatus: joi.bool().default(false),
        updateVetsName: joi.bool().default(false),
        updateDateOfVisit: joi.bool().default(false),
        updateVetRCVSNumber: joi.bool().default(false),
      }),
    },
    handler: async (request, h) => {
      const { page, returnPage } = request.query;
      return buildViewClaim(request, h, {
        reference: request.params.reference,
        page,
        returnPage,
        formFlags: request.query,
        errors: [],
      });
    },
  },
};
