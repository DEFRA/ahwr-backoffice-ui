import { STATUS } from "ffc-ahwr-common-library";

export const ALL_STATUS = "ALL";

const formatText = (str) =>
  str
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

export const getClaimStatusOptions = (selectedStatus) => [
  {
    value: ALL_STATUS,
    text: "All statuses",
    selected: selectedStatus === ALL_STATUS,
  },
  ...Object.values(STATUS).map((value) => ({
    value,
    text: formatText(value),
    selected: value === selectedStatus,
  })),
];
