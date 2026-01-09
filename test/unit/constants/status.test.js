import { getStyleClassByStatus } from "../../../app/constants/status";

describe("getStyleClassByStatus", () => {
  it("returns orange if the rawStatus arg is undefined", () => {
    expect(getStyleClassByStatus()).toBe("govuk-tag--orange");
  });

  it("returns a tag colour for a status", () => {
    expect(getStyleClassByStatus("AGREED")).toBe("govuk-tag--green");
  });

  it("returns orange if the rawStatus arg is not a key in the lookup", () => {
    expect(getStyleClassByStatus("WEIRD")).toBe("govuk-tag--orange");
  });
});
