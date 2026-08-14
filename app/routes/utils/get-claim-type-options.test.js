import { getClaimTypeOptions } from "./get-claim-type-options.js";
import { CLAIM_TYPE } from "../../constants/index.js";

describe("getClaimTypeOptions", () => {
  test("returns the all, review and endemics options in order", () => {
    const options = getClaimTypeOptions(CLAIM_TYPE.ALL);

    expect(options).toEqual([
      { value: CLAIM_TYPE.ALL, text: "All types", selected: true },
      { value: CLAIM_TYPE.REVIEW, text: "Review", selected: false },
      { value: CLAIM_TYPE.FOLLOW_UP, text: "Endemics", selected: false },
    ]);
  });

  test("marks the given claim type as selected", () => {
    const options = getClaimTypeOptions(CLAIM_TYPE.REVIEW);

    expect(options.find((option) => option.selected)).toEqual({
      value: CLAIM_TYPE.REVIEW,
      text: "Review",
      selected: true,
    });
  });
});
