import { STATUS } from "ffc-ahwr-common-library";
import { formattedDateToUk } from "../../lib/display-helper.js";
const {
  AGREED,
  WITHDRAWN,
  READY_TO_PAY,
  REJECTED,
  IN_CHECK,
  ON_HOLD,
  RECOMMENDED_TO_PAY,
  RECOMMENDED_TO_REJECT,
  PAID,
} = STATUS;

const getAction = (updatedProperty, newValue, oldValue) => {
  const statuses = {
    [AGREED]: "Agreed",
    [WITHDRAWN]: "Withdrawn",
    [READY_TO_PAY]: "Approved",
    [REJECTED]: "Rejected",
    [IN_CHECK]: "Moved to 'In Check'",
    [ON_HOLD]: "Moved to 'On Hold'",
    [RECOMMENDED_TO_PAY]: "Recommended to Pay",
    [RECOMMENDED_TO_REJECT]: "Recommended to Reject",
    [PAID]: "Paid",
  };

  // TODO - make sure updated property in this data is no longer statusId as it doesnt exist anymore
  if (updatedProperty === "status") {
    return statuses[newValue];
  }

  const dataProperties = {
    vetsName: `Vet updated from ${oldValue} to ${newValue}`,
    vetName: `Vet updated from ${oldValue} to ${newValue}`,
    vetRCVSNumber: `RCVS updated from ${oldValue} to ${newValue}`,
    vetRcvs: `RCVS updated from ${oldValue} to ${newValue}`,
    dateOfVisit: `Date of visit updated from ${formattedDateToUk(oldValue)} to ${formattedDateToUk(newValue)}`,
    visitDate: `Date of review updated from ${formattedDateToUk(oldValue)} to ${formattedDateToUk(newValue)}`,
    agreementFlag: `Agreement was moved from ${oldValue} to ${newValue}`,
    testResults: `Test results updated from ${oldValue} to ${newValue}`,
    herdName: `Herd details were updated from ${oldValue} to ${newValue}`,
    laboratoryUrn: `Laboratory URN was updated from ${oldValue} to ${newValue}`,
    eligiblePiiRedaction: `Eligible for automated data redaction updated from ${oldValue} to ${newValue}`,
  };

  return dataProperties[updatedProperty];
};

const getHistoryTableHeader = () => [
  { text: "Date" },
  { text: "Time" },
  { text: "Action" },
  { text: "User" },
  { text: "Note", classes: "govuk-!-width-one-quarter" },
];

const getHistoryTableRows = (historyRecords) =>
  historyRecords.map(({ updatedProperty, newValue, oldValue, updatedAt, updatedBy, note }) => {
    const action = getAction(updatedProperty, newValue, oldValue);

    const updatedDate = new Date(updatedAt);
    return [
      {
        text: updatedDate.toLocaleString("en-GB", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        }),
      },
      {
        text: updatedDate.toLocaleString("en-GB", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        }),
      },
      { text: action },
      { text: updatedBy },
      { text: note },
    ];
  });

export const getHistoryDetails = (historyRecords) => ({
  header: getHistoryTableHeader(),
  rows: getHistoryTableRows(historyRecords),
});
