import {
  extractDateRangeParts,
  buildDateFilter,
  resolveDateRange,
} from "../../../../app/routes/utils/date-filter.js";

describe("extractDateRangeParts", () => {
  const payload = {
    "dateFrom-day": "1",
    "dateFrom-month": "2",
    "dateFrom-year": "2026",
    "dateTo-day": "15",
    "dateTo-month": "7",
    "dateTo-year": "2026",
  };

  test("reads the prefixed day, month and year of both bounds for an advanced search", () => {
    expect(extractDateRangeParts(payload, true)).toEqual({
      dateFrom: { day: "1", month: "2", year: "2026" },
      dateTo: { day: "15", month: "7", year: "2026" },
    });
  });

  test("defaults missing parts to empty strings for an empty advanced-search payload", () => {
    expect(extractDateRangeParts({}, true)).toEqual({
      dateFrom: { day: "", month: "", year: "" },
      dateTo: { day: "", month: "", year: "" },
    });
  });

  test("defaults missing parts to empty strings for an absent advanced-search payload", () => {
    expect(extractDateRangeParts(undefined, true)).toEqual({
      dateFrom: { day: "", month: "", year: "" },
      dateTo: { day: "", month: "", year: "" },
    });
  });

  test("clears both bounds to empty parts for a basic search", () => {
    expect(extractDateRangeParts(payload, false)).toEqual({
      dateFrom: { day: "", month: "", year: "" },
      dateTo: { day: "", month: "", year: "" },
    });
  });
});

describe("buildDateFilter", () => {
  test("builds a UTC date value and repopulation items for a valid date", () => {
    const filter = buildDateFilter({ day: "15", month: "7", year: "2026" });

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
    expect(buildDateFilter(parts).value).toBeUndefined();
  });

  test("bounds the value to the end of the day when endOfDay is set", () => {
    const filter = buildDateFilter(
      { day: "15", month: "7", year: "2026" },
      {
        endOfDay: true,
      },
    );

    expect(filter.value).toEqual(new Date(Date.UTC(2026, 6, 15, 23, 59, 59, 999)));
  });

  test.each([
    { day: "31", month: "1", year: "2026", label: "a 31-day month (January)" },
    { day: "30", month: "4", year: "2026", label: "a 30-day month (April)" },
    { day: "28", month: "2", year: "2026", label: "the last day of a non-leap February" },
    { day: "29", month: "2", year: "2024", label: "the last day of a leap February" },
    { day: "31", month: "12", year: "2026", label: "the last day of the year" },
  ])("bounds the value to the last millisecond of the day at $label", ({ day, month, year }) => {
    const filter = buildDateFilter({ day, month, year }, { endOfDay: true });

    expect(filter.value).toEqual(
      new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999)),
    );
  });

  test("still returns repopulation items when the date is invalid", () => {
    const filter = buildDateFilter({ day: "31", month: "2", year: "2026" });

    expect(filter.items).toEqual([
      { name: "day", classes: "govuk-input--width-2", value: "31" },
      { name: "month", classes: "govuk-input--width-2", value: "2" },
      { name: "year", classes: "govuk-input--width-4", value: "2026" },
    ]);
  });
});

describe("resolveDateRange", () => {
  const filterFor = (parts, options) => buildDateFilter(parts, options);
  const from = (parts) => filterFor(parts);
  const to = (parts) => filterFor(parts, { endOfDay: true });

  test("returns both bounds for a valid range", () => {
    const range = resolveDateRange(
      from({ day: "1", month: "2", year: "2026" }),
      to({ day: "15", month: "7", year: "2026" }),
    );

    expect(range).toEqual({
      dateFrom: new Date(Date.UTC(2026, 1, 1)),
      dateTo: new Date(Date.UTC(2026, 6, 15, 23, 59, 59, 999)),
    });
  });

  test("keeps a same-day range (to is the end of that day)", () => {
    const range = resolveDateRange(
      from({ day: "15", month: "7", year: "2026" }),
      to({ day: "15", month: "7", year: "2026" }),
    );

    expect(range).toEqual({
      dateFrom: new Date(Date.UTC(2026, 6, 15)),
      dateTo: new Date(Date.UTC(2026, 6, 15, 23, 59, 59, 999)),
    });
  });

  test("drops both bounds when the to date is earlier than the from date", () => {
    const range = resolveDateRange(
      from({ day: "16", month: "7", year: "2026" }),
      to({ day: "15", month: "7", year: "2026" }),
    );

    expect(range).toEqual({ dateFrom: undefined, dateTo: undefined });
  });

  test("keeps the from bound when only the from date is provided", () => {
    expect(resolveDateRange(from({ day: "1", month: "2", year: "2026" }), to({}))).toEqual({
      dateFrom: new Date(Date.UTC(2026, 1, 1)),
      dateTo: undefined,
    });
  });

  test("keeps the to bound when only the to date is provided", () => {
    expect(resolveDateRange(from({}), to({ day: "15", month: "7", year: "2026" }))).toEqual({
      dateFrom: undefined,
      dateTo: new Date(Date.UTC(2026, 6, 15, 23, 59, 59, 999)),
    });
  });
});
