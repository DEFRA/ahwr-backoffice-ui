import { FLAG } from "../../constants/index.js";

export const claimFlagLabels = Object.freeze({
  [FLAG.ALL]: "All Types",
  [FLAG.FLAGGED]: "Flagged",
  [FLAG.NOT_FLAGGED]: "Not Flagged",
});

export const getClaimFlagOptions = (selectedFlag) =>
  Object.entries(claimFlagLabels).map(([value, text]) => ({
    value,
    text,
    selected: value === selectedFlag,
  }));
