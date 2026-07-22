import {
  getAgreementTypeOptions,
  getStatusOptions,
  getFlagOptions,
} from "../../../../app/routes/utils/get-agreement-type-options.js";
import { FLAG, AGREEMENT_STATUS, AGREEMENT_TYPE } from "../../../../app/constants/index.js";

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

describe("getStatusOptions", () => {
  test("returns the all, agreed and not agreed options in order", () => {
    const options = getStatusOptions(AGREEMENT_TYPE.ALL);

    expect(options).toEqual([
      { value: AGREEMENT_STATUS.ALL, text: "All statuses", selected: true },
      { value: AGREEMENT_STATUS.AGREED, text: "Agreed", selected: false },
      { value: AGREEMENT_STATUS.NOT_AGREED, text: "Not agreed", selected: false },
    ]);
  });

  test("marks the given agreement type as selected", () => {
    const options = getStatusOptions(AGREEMENT_STATUS.AGREED);

    expect(options.find((option) => option.selected)).toEqual({
      value: AGREEMENT_STATUS.AGREED,
      text: "Agreed",
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
