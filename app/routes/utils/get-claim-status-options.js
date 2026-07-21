import { STATUS } from "ffc-ahwr-common-library";
import { upperFirstLetter } from "../../lib/display-helper.js";

export const SEARCH_STATUS = Object.freeze({
  ALL: "ALL",
  ...STATUS,
});

const formatStatusText = (status) => upperFirstLetter(status.toLowerCase()).replaceAll("_", " ");

export const getClaimStatusOptions = (selectedStatus) =>
  Object.values(SEARCH_STATUS).map((status) => ({
    value: status,
    text: status === SEARCH_STATUS.ALL ? "All statuses" : formatStatusText(status),
    selected: status === selectedStatus,
  }));
