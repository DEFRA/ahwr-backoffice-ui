import { formattedDateToUk, upperFirstLetter } from "../../lib/display-helper.js";
import { getStyleClassByStatus } from "../../constants/status.js";
import { speciesNumbers } from "../../constants/species-numbers.js";
import { STATUS } from "ffc-ahwr-common-library";

export const getApplicationDetails = (application, statusActions, eligiblePiiRedactionActions) => {
  const { data, createdAt, status, eligiblePiiRedaction } = application;
  const formattedDate = formattedDateToUk(createdAt);

  const statusLabel = upperFirstLetter(status.toLowerCase().replaceAll(/_/g, " "));
  const statusClass = getStyleClassByStatus(status);

  return [
    {
      key: { text: "Status" },
      value: {
        html: `<span class="govuk-tag app-long-tag ${statusClass}">${statusLabel}</span>`,
      },
      actions: statusActions,
    },
    {
      key: {
        text: status === STATUS.NOT_AGREED ? "Date agreement rejected" : "Date of agreement",
      },
      value: { text: formattedDate },
    },
    {
      key: { text: "Business details correct" },
      value: { text: upperFirstLetter(data.confirmCheckDetails) },
    },
    {
      key: { text: "Type of review" },
      value: { text: upperFirstLetter(data.whichReview) },
    },
    {
      key: { text: "Number of livestock" },
      value: { text: speciesNumbers[data.whichReview] },
    },
    {
      key: { text: "Agreement accepted" },
      value: { text: data.offerStatus === "accepted" ? "Yes" : "No" },
    },
    {
      key: { text: "Eligible for automated data redaction" },
      value: { text: eligiblePiiRedaction ? "Yes" : "No" },
      actions: eligiblePiiRedactionActions,
    },
  ];
};
