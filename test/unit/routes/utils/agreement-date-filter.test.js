import {
  extractDateParts,
  buildAgreementDateFilter,
} from "../../../../app/routes/utils/agreement-date-filter.js";

describe("extractDateParts", () => {
  test("reads the prefixed day, month and year from the payload", () => {
    const payload = {
      "dateFrom-day": "1",
      "dateFrom-month": "2",
      "dateFrom-year": "2026",
      "dateTo-day": "15",
      "dateTo-month": "7",
      "dateTo-year": "2026",
    };

    expect(extractDateParts(payload, "dateFrom")).toEqual({
      day: "1",
      month: "2",
      year: "2026",
    });
    expect(extractDateParts(payload, "dateTo")).toEqual({
      day: "15",
      month: "7",
      year: "2026",
    });
  });

  test("defaults missing parts to empty strings", () => {
    expect(extractDateParts({}, "dateFrom")).toEqual({ day: "", month: "", year: "" });
    expect(extractDateParts(undefined, "dateFrom")).toEqual({ day: "", month: "", year: "" });
  });
});

describe("buildAgreementDateFilter", () => {
  test("builds a UTC date value and repopulation items for a valid date", () => {
    const filter = buildAgreementDateFilter({ day: "15", month: "7", year: "2026" });

    expect(filter.value).toEqual(new Date(Date.UTC(2026, 6, 15)));
    expect(filter.items).toEqual([
      { name: "day", classes: "govuk-input--width-2", value: "15" },
      { name: "month", classes: "govuk-input--width-2", value: "7" },
      { name: "year", classes: "govuk-input--width-4", value: "2026" },
    ]);
  });

  test.each([
    { parts: { day: "", month: "", year: "" }, reason: "empty" },
    { parts: { day: "15", month: "", year: "2026" }, reason: "partial" },
    { parts: { day: "aa", month: "7", year: "2026" }, reason: "non-numeric" },
    { parts: { day: "31", month: "2", year: "2026" }, reason: "impossible calendar date" },
    { parts: { day: "0", month: "7", year: "2026" }, reason: "day out of range" },
    { parts: undefined, reason: "no parts" },
  ])("returns an undefined value for $reason input", ({ parts }) => {
    expect(buildAgreementDateFilter(parts).value).toBeUndefined();
  });

  test("bounds the value to the end of the day when endOfDay is set", () => {
    const filter = buildAgreementDateFilter(
      { day: "15", month: "7", year: "2026" },
      {
        endOfDay: true,
      },
    );

    expect(filter.value).toEqual(new Date(Date.UTC(2026, 6, 15, 23, 59, 59, 999)));
  });

  test("still returns repopulation items when the date is invalid", () => {
    const filter = buildAgreementDateFilter({ day: "31", month: "2", year: "2026" });

    expect(filter.items).toEqual([
      { name: "day", classes: "govuk-input--width-2", value: "31" },
      { name: "month", classes: "govuk-input--width-2", value: "2" },
      { name: "year", classes: "govuk-input--width-4", value: "2026" },
    ]);
  });
});
