import { getStyleClassByStatus } from "../constants/status.js";
import { formattedDateToUk, upperFirstLetter } from "./display-helper.js";
import { buildKeyValueJson } from "./row-helper.js";

export function createStatusRow(claimStatus, statusActions, showWithdrawalRequested) {
  const html = showWithdrawalRequested
    ? `<div class="govuk-grid-column-two-thirds govuk-!-padding-left-0">
  <span class="govuk-heading-s govuk-!-margin-bottom-1">Change to:</span>
  <div class="govuk-tag govuk-!-margin-top-0 govuk-!-margin-bottom-4 govuk-!-text-align-left govuk-tag--grey">Withdrawn</div>
  
  <span class="govuk-heading-s govuk-!-margin-bottom-1">Change from:</span>
  <div class="govuk-tag govuk-!-margin-top-0 govuk-!-margin-bottom-4 govuk-!-text-align-left govuk-tag--orange">In check</div>
  </div>`
    : `<span class='app-long-tag'><span class='govuk-tag responsive-text ${getStyleClassByStatus(claimStatus.replaceAll("_", " "))}'> ${upperFirstLetter(claimStatus.replaceAll("_", " ").toLowerCase())} </span></span>`;

  return {
    key: { text: "Status" },
    value: {
      html,
    },
    actions: statusActions,
  };
}

export function createDateOfVisitRow(dateOfVisit, dateOfVisitActions) {
  return {
    ...buildKeyValueJson("Date of visit", formattedDateToUk(dateOfVisit), true),
    actions: dateOfVisitActions,
  };
}

export function createVetNameRow(vetsName, updateVetsNameAction, urlParameters) {
  const vetsNameActions = getAction(
    updateVetsNameAction,
    "updateVetsName",
    "vet's name",
    "update-vets-name",
    urlParameters,
  );

  return {
    ...buildKeyValueJson("Vet's name", upperFirstLetter(vetsName), true),
    actions: vetsNameActions,
  };
}

export function getVetRows(
  data,
  { updateVetsNameAction, updateVetRCVSNumberAction },
  urlParameters,
) {
  const vetName = createVetNameRow(data?.vetsName, updateVetsNameAction, urlParameters);

  const vetRCVSNumberActions = getAction(
    updateVetRCVSNumberAction,
    "updateVetRCVSNumber",
    "RCVS number",
    "update-vet-rcvs-number",
    urlParameters,
  );

  const vetRCVSNumber = {
    ...buildKeyValueJson("Vet's RCVS number", data?.vetRCVSNumber, true),
    actions: vetRCVSNumberActions,
  };
  return [vetName, vetRCVSNumber];
}

export const getAction = (
  createItems,
  query,
  visuallyHiddenText,
  id,
  { claimReference, page, returnPage },
) => {
  if (!createItems) {
    return null;
  }

  return {
    items: [
      {
        href: `/view-claim/${claimReference}?${query}=true&page=${page}&returnPage=${returnPage}#${id}`,
        text: "Change",
        visuallyHiddenText,
      },
    ],
  };
};
