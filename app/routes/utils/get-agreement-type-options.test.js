import { getAgreementTypeOptions, getFlagOptions } from "./get-agreement-type-options.js";
import { FLAG, AGREEMENT_TYPE } from "../../constants/index.js";

describe("getAgreementTypeOptions", () => {
  test("returns the all, IAHW and PBR options in order", () => {
    const options = getAgreementTypeOptions(AGREEMENT_TYPE.ALL);

    expect(options).toEqual([
      { value: AGREEMENT_TYPE.ALL, text: "All types", selected: true },
      {
        value: AGREEMENT_TYPE.IAHW,
        text: "Improve Animal Health and Welfare (IAHW)",
        selected: false,
      },
      {
        value: AGREEMENT_TYPE.PBR,
        text: "Poultry Biosecurity Review (PBR)",
        selected: false,
      },
    ]);
  });

  test("marks the given agreement type as selected", () => {
    const options = getAgreementTypeOptions(AGREEMENT_TYPE.IAHW);

    expect(options.find((option) => option.selected)).toEqual({
      value: AGREEMENT_TYPE.IAHW,
      text: "Improve Animal Health and Welfare (IAHW)",
      selected: true,
    });
  });
});

describe("getFlagOptions", () => {
  test("returns the all, flagged and not flagged options in order", () => {
    const options = getFlagOptions(FLAG.ALL);

    expect(options).toEqual([
      { value: FLAG.ALL, text: "All flags", selected: true },
      { value: FLAG.FLAGGED, text: "Flagged", selected: false },
      { value: FLAG.NOT_FLAGGED, text: "Not flagged", selected: false },
    ]);
  });

  test("marks the given flag as selected", () => {
    const options = getFlagOptions(FLAG.FLAGGED);

    expect(options.find((option) => option.selected)).toEqual({
      value: FLAG.FLAGGED,
      text: "Flagged",
      selected: true,
    });
  });
});
