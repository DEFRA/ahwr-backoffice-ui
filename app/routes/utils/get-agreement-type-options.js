import {
  AGREEMENT_TYPE_ALL,
  AGREEMENT_TYPE_IAHW,
  AGREEMENT_TYPE_PBR,
} from "../../constants/index.js";

const agreementTypeLabels = {
  [AGREEMENT_TYPE_ALL]: "All types",
  [AGREEMENT_TYPE_IAHW]: "IAHW",
  [AGREEMENT_TYPE_PBR]: "PBR",
};

export const getAgreementTypeOptions = (selectedAgreementType) =>
  Object.entries(agreementTypeLabels).map(([value, text]) => ({
    value,
    text,
    selected: value === selectedAgreementType,
  }));
