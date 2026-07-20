import { AGREEMENT_TYPE, AGREEMENT_STATUS, AGREEMENT_FLAG } from "../../constants/index.js";

const agreementTypeLabels = {
  [AGREEMENT_TYPE.ALL]: "All types",
  [AGREEMENT_TYPE.IAHW]: "IAHW",
  [AGREEMENT_TYPE.PBR]: "PBR",
};

const statusLabels = {
  [AGREEMENT_STATUS.ALL]: "All statuses",
  [AGREEMENT_STATUS.AGREED]: "Agreed",
  [AGREEMENT_STATUS.NOT_AGREED]: "Not agreed",
};

const flagLabels = {
  [AGREEMENT_FLAG.ALL]: "All flags",
  [AGREEMENT_FLAG.FLAGGED]: "Flagged",
  [AGREEMENT_FLAG.NOT_FLAGGED]: "Not flagged",
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
