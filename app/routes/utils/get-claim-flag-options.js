import { FLAG } from "../../constants/index.js";

export const claimFlagLabels = Object.freeze({
  [FLAG.ALL]: "All flags",
  [FLAG.FLAGGED]: "Flagged",
  [FLAG.NOT_FLAGGED]: "Not flagged",
});

export const getClaimFlagOptions = (selectedFlag) =>
  Object.entries(claimFlagLabels).map(([value, text]) => ({
    value,
    text,
    selected: value === selectedFlag,
  }));
