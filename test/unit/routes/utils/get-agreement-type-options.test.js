import { getAgreementTypeOptions } from "../../../../app/routes/utils/get-agreement-type-options.js";
import { AGREEMENT_TYPE } from "../../../../app/constants/index.js";

describe("getAgreementTypeOptions", () => {
  test("returns the all, IAHW and PBR options in order", () => {
    const options = getAgreementTypeOptions(AGREEMENT_TYPE.ALL);

    expect(options).toEqual([
      { value: AGREEMENT_TYPE.ALL, text: "All types", selected: true },
      { value: AGREEMENT_TYPE.IAHW, text: "IAHW", selected: false },
      { value: AGREEMENT_TYPE.PBR, text: "PBR", selected: false },
    ]);
  });

  test("marks the given agreement type as selected", () => {
    const options = getAgreementTypeOptions(AGREEMENT_TYPE.IAHW);

    expect(options.find((option) => option.selected)).toEqual({
      value: AGREEMENT_TYPE.IAHW,
      text: "IAHW",
      selected: true,
    });
  });
});
