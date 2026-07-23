import { CLAIM_TYPE } from "../../constants/index.js";

export const claimTypeLabels = Object.freeze({
  [CLAIM_TYPE.ALL]: "All types",
  [CLAIM_TYPE.REVIEW]: "Review",
  [CLAIM_TYPE.FOLLOW_UP]: "Endemics",
});

export const getClaimTypeOptions = (selectedClaimType) =>
  Object.entries(claimTypeLabels).map(([value, text]) => ({
    value,
    text,
    selected: value === selectedClaimType,
  }));
