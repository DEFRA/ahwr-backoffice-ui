import { getFormFlags } from "../../../../app/routes/utils/get-form-flags.js";
import { DEFAULT_FORM_FLAGS } from "../../../../app/routes/utils/get-claim-view-states.js";

test("sets the named flag true and every other flag false", () => {
  const flags = getFormFlags("updateStatus");

  expect(flags.updateStatus).toBe(true);
  expect(flags.updateVetsName).toBe(false);
  expect(flags.recommendToPay).toBe(false);
});

test("opens none of the known forms when the key matches nothing", () => {
  const flags = getFormFlags("notARealForm");

  for (const key of Object.keys(DEFAULT_FORM_FLAGS)) {
    expect(flags[key]).toBe(false);
  }
});

test("covers every form flag getClaimViewStates reads", () => {
  expect(Object.keys(getFormFlags("updateStatus"))).toEqual(
    expect.arrayContaining([
      "withdraw",
      "moveToInCheck",
      "recommendToPay",
      "recommendToReject",
      "approve",
      "reject",
      "updateStatus",
      "updateVetsName",
      "updateDateOfVisit",
      "updateVetRCVSNumber",
      "updateEligiblePiiRedaction",
    ]),
  );
});
