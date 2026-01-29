import { formattedDateToUk, upperFirstLetter } from "../../lib/display-helper.js";
import { getStyleClassByStatus } from "../../constants/status.js";

const claimDataStatus = new Set([
  "IN_CHECK",
  "REJECTED",
  "READY_TO_PAY",
  "ON_HOLD",
  "PAID",
  "RECOMMENDED_TO_PAY",
  "RECOMMENDED_TO_REJECT",
]);

export const getApplicationClaimDetails = (
  application,
  visitDateActions,
  vetsNameActions,
  vetRCVSNumberActions,
) => {
  if (!application.claimed && !claimDataStatus.has(application.status)) {
    return null;
  }

  const { data, status } = application;
  let formattedDate = "";

  if (data?.dateOfClaim) {
    formattedDate = formattedDateToUk(data?.dateOfClaim);
  }

  const statusLabel = upperFirstLetter(status.toLowerCase().replaceAll("_", " "));
  const statusClass = getStyleClassByStatus(status);

  return [
    {
      key: { text: "Status" },
      value: {
        html: `<span class="govuk-tag app-long-tag ${statusClass}">${statusLabel}</span>`,
      },
    },
    {
      key: { text: "Date of review" },
      value: { text: data.visitDate ? formattedDateToUk(data.visitDate) : "N/A" },
      actions: visitDateActions,
    },
    {
      key: { text: "Date of testing" },
      value: { text: data.dateOfTesting ? formattedDateToUk(data.dateOfTesting) : "N/A" },
    },
    { key: { text: "Date of claim" }, value: { text: formattedDate } },
    {
      key: { text: "Review details confirmed" },
      value: { text: upperFirstLetter(data.confirmCheckDetails) },
    },
    {
      key: { text: "Vet’s name" },
      value: { text: data.vetName },
      actions: vetsNameActions,
    },
    {
      key: { text: "Vet’s RCVS number" },
      value: { text: data.vetRcvs },
      actions: vetRCVSNumberActions,
    },
    {
      key: { text: "Test results unique reference number (URN)" },
      value: { text: data.urnResult },
    },
  ];
};
