import { AGREEMENT_TYPE } from "../../constants/index.js";

const agreementTypeLabels = {
  [AGREEMENT_TYPE.ALL]: "All types",
  [AGREEMENT_TYPE.IAHW]: "IAHW",
  [AGREEMENT_TYPE.PBR]: "PBR",
};

export const getAgreementTypeOptions = (selectedAgreementType) =>
  Object.entries(agreementTypeLabels).map(([value, text]) => ({
    value,
    text,
    selected: value === selectedAgreementType,
  }));
