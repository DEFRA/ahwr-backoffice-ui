import { getAgreementTypeOptions } from "../../../../app/routes/utils/get-agreement-type-options.js";
import {
  AGREEMENT_TYPE_ALL,
  AGREEMENT_TYPE_IAHW,
  AGREEMENT_TYPE_PBR,
} from "../../../../app/constants/index.js";

describe("getAgreementTypeOptions", () => {
  test("returns the all, IAHW and PBR options in order", () => {
    const options = getAgreementTypeOptions(AGREEMENT_TYPE_ALL);

    expect(options).toEqual([
      { value: AGREEMENT_TYPE_ALL, text: "All types", selected: true },
      { value: AGREEMENT_TYPE_IAHW, text: "IAHW", selected: false },
      { value: AGREEMENT_TYPE_PBR, text: "PBR", selected: false },
    ]);
  });

  test("marks the given agreement type as selected", () => {
    const options = getAgreementTypeOptions(AGREEMENT_TYPE_IAHW);

    expect(options.find((option) => option.selected)).toEqual({
      value: AGREEMENT_TYPE_IAHW,
      text: "IAHW",
      selected: true,
    });
  });
});
