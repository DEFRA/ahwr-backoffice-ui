import { AGREEMENT_TYPE, AGREEMENT_STATUS, FLAG } from "../../constants/index.js";

const agreementTypeLabels = {
  [AGREEMENT_TYPE.ALL]: "All types",
  [AGREEMENT_TYPE.IAHW]: "Improve Animal Health and Welfare (IAHW)",
  [AGREEMENT_TYPE.PBR]: "Poultry Biosecurity Review (PBR)",
};

const statusLabels = {
  [AGREEMENT_STATUS.ALL]: "All statuses",
  [AGREEMENT_STATUS.AGREED]: "Agreed",
  [AGREEMENT_STATUS.NOT_AGREED]: "Not agreed",
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

export const getStatusOptions = (selectedStatus) =>
  Object.entries(statusLabels).map(([value, text]) => ({
    value,
    text,
    selected: value === selectedStatus,
  }));

export const getFlagOptions = (selectedFlag) =>
  Object.entries(flagLabels).map(([value, text]) => ({
    value,
    text,
    selected: value === selectedFlag,
  }));
