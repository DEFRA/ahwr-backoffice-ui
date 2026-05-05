import { getStyleClassByStatus } from "../constants/status.js";
import { formattedDateToUk, upperFirstLetter } from "./display-helper.js";
import { buildKeyValueJson } from "./row-helper.js";

export function createStatusRow(claimStatus, statusActions) {
  return {
    key: { text: "Status" },
    value: {
      html: `<span class='app-long-tag'><span class='govuk-tag responsive-text ${getStyleClassByStatus(claimStatus.replaceAll("_", " "))}'> ${upperFirstLetter(claimStatus.replaceAll("_", " ").toLowerCase())} </span></span>`,
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
const getAction = (
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
