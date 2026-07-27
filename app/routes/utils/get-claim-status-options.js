import { upperFirstLetter } from "../../lib/display-helper.js";

export const SEARCH_STATUS = Object.freeze({
  ALL: "ALL",
  ON_HOLD: "ON_HOLD",
  IN_CHECK: "IN_CHECK",
  RECOMMENDED_TO_PAY: "RECOMMENDED_TO_PAY",
  RECOMMENDED_TO_REJECT: "RECOMMENDED_TO_REJECT",
  READY_TO_PAY: "READY_TO_PAY",
  REJECTED: "REJECTED",
  PAID: "PAID",
  WITHDRAWN: "WITHDRAWN",
});

const formatStatusText = (status) => upperFirstLetter(status.toLowerCase()).replaceAll("_", " ");

export const getClaimStatusOptions = (selectedStatus) =>
  Object.values(SEARCH_STATUS).map((status) => ({
    value: status,
    text: status === SEARCH_STATUS.ALL ? "All statuses" : formatStatusText(status),
    selected: status === selectedStatus,
  }));
