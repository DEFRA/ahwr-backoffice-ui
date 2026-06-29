import joi from "joi";
import { getApplication, getOldWorldApplicationHistory } from "../api/applications.js";
import { permissions } from "../auth/permissions.js";
import { getStyleClassByStatus } from "../constants/status.js";
import { getClaimViewStates } from "./utils/get-claim-view-states.js";
import { getCurrentStatusEvent } from "./utils/get-current-status-event.js";
import { getErrorMessagesByKey } from "./utils/get-error-messages-by-key.js";
import { getContactHistory, displayContactHistory } from "../api/contact-history.js";
import { upperFirstLetter } from "../lib/display-helper.js";
import { getOrganisationDetails } from "./models/organisation-details.js";
import { getApplicationDetails } from "./models/application-details.js";
import { getHistoryDetails } from "./models/application-history.js";
import { getApplicationClaimDetails } from "./models/application-claim.js";

const { administrator, processor, user, recommender, authoriser } = permissions;

const buildAgreementChangeActions = (viewStates, reference, page) => {
  const getAction = (query, visuallyHiddenText, id) => ({
    items: [
      {
        href: `/view-agreement/${reference}?${query}=true&page=${page}#${id}`,
        text: "Change",
        visuallyHiddenText,
      },
    ],
  });

  return {
    dateOfVisitActions: viewStates.updateDateOfVisitAction
      ? getAction("updateDateOfVisit", "date of review", "update-date-of-visit")
      : null,
    vetsNameActions: viewStates.updateVetsNameAction
      ? getAction("updateVetsName", "vet's name", "update-vets-name")
      : null,
    vetRCVSNumberActions: viewStates.updateVetRCVSNumberAction
      ? getAction("updateVetRCVSNumber", "RCVS number", "update-vet-rcvs-number")
      : null,
    eligiblePiiRedactionActions: viewStates.updateEligiblePiiRedactionAction
      ? getAction(
          "updateEligiblePiiRedaction",
          "eligible for automated data redaction",
          "update-eligible-pii-redaction",
        )
      : null,
  };
};

// Viewing OW agreement
export const buildViewAgreement = async (
  request,
  h,
  { reference, page, formFlags, errors = [] },
) => {
  const application = await getApplication(reference, request.logger);
  const { status } = application;
  const { historyRecords } = await getOldWorldApplicationHistory(
    application.reference,
    request.logger,
  );
  const currentStatusEvent = getCurrentStatusEvent(application, historyRecords);

  const statusLabel = upperFirstLetter(status.toLowerCase().replaceAll("_", " "));

  const statusClass = getStyleClassByStatus(status);

  const viewStates = application.redacted
    ? {}
    : getClaimViewStates(request, status, currentStatusEvent, formFlags);
  const { updateVetsNameForm, updateVetRCVSNumberForm, updateDateOfVisitForm } = viewStates;
  const { updateEligiblePiiRedactionAction, updateEligiblePiiRedactionForm } = viewStates;

  const { dateOfVisitActions, vetsNameActions, vetRCVSNumberActions, eligiblePiiRedactionActions } =
    buildAgreementChangeActions(viewStates, application.reference, page);

  const contactHistory = await getContactHistory(reference, request.logger);
  const contactHistoryDetails = displayContactHistory(contactHistory);
  const { organisation } = application;
  const organisationDetails = getOrganisationDetails(organisation, contactHistoryDetails);
  const applicationDetails = getApplicationDetails(application, eligiblePiiRedactionActions);
  const historyDetails = getHistoryDetails(historyRecords);
  const applicationClaimDetails = getApplicationClaimDetails(
    application,
    dateOfVisitActions,
    vetsNameActions,
    vetRCVSNumberActions,
  );
  const errorMessages = getErrorMessagesByKey(errors);

  return h.view("view-agreement", {
    page,
    reference: application.reference,
    claimOrAgreement: "agreement",
    statusLabel,
    statusClass,
    organisationName: organisation.name,
    vetVisit: application.vetVisit,
    claimed: application.claimed,
    payment: application.payment,
    organisationDetails,
    applicationDetails,
    historyDetails,
    applicationClaimDetails,
    updateDateOfVisitForm,
    updateVetsNameForm,
    updateVetRCVSNumberForm,
    updateEligiblePiiRedactionAction,
    updateEligiblePiiRedactionForm,
    eligiblePiiRedaction: application.eligiblePiiRedaction,
    errorMessages,
    errors,
  });
};

export const viewAgreementRoute = {
  method: "get",
  path: "/view-agreement/{reference}",
  options: {
    auth: { scope: [administrator, processor, user, recommender, authoriser] },
    validate: {
      params: joi.object({
        reference: joi.string(),
      }),
      query: joi.object({
        page: joi.number().greater(0).default(1),
        errors: joi.any().strip(),
        updateVetsName: joi.bool().default(false),
        updateDateOfVisit: joi.bool().default(false),
        updateVetRCVSNumber: joi.bool().default(false),
        updateEligiblePiiRedaction: joi.bool().default(false),
      }),
    },
    handler: async (request, h) => {
      return buildViewAgreement(request, h, {
        reference: request.params.reference,
        page: request.query.page,
        formFlags: request.query,
        errors: [],
      });
    },
  },
};
