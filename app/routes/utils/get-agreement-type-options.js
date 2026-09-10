import { AGREEMENT_TYPE, FLAG } from "../../constants/index.js";

const agreementTypeLabels = {
  [AGREEMENT_TYPE.ALL]: "All types",
  [AGREEMENT_TYPE.IAHW]: "Improve Animal Health and Welfare (IAHW)",
  [AGREEMENT_TYPE.PBR]: "Poultry Biosecurity Review (PBR)",
};

const flagLabels = {
  [FLAG.ALL]: "All flags",
  [FLAG.FLAGGED]: "Flagged",
  [FLAG.NOT_FLAGGED]: "Not flagged",
};

export const getAgreementTypeOptions = (selectedAgreementType) =>
  Object.entries(agreementTypeLabels).map(([value, text]) => ({
    value,
    text,
    selected: value === selectedAgreementType,
  }));

export const getFlagOptions = (selectedFlag) =>
  Object.entries(flagLabels).map(([value, text]) => ({
    value,
    text,
    selected: value === selectedFlag,
  }));
