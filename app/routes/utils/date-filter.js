export const emptyDateParts = { day: "", month: "", year: "" };

// JavaScript Date months are zero-based, so a calendar month maps to month - 1.
const MONTH_INDEX_OFFSET = 1;
// Steps used to derive the inclusive end of a "date to" day.
const ONE_DAY = 1;
const ONE_MILLISECOND = 1;

export const extractDateParts = (payload, prefix) => ({
  day: payload?.[`${prefix}-day`] ?? "",
  month: payload?.[`${prefix}-month`] ?? "",
  year: payload?.[`${prefix}-year`] ?? "",
});

const isRealDate = (day, month, year) => {
  const monthIndex = month - MONTH_INDEX_OFFSET;
  const date = new Date(Date.UTC(year, monthIndex, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === monthIndex && date.getUTCDate() === day
  );
};

const toDate = ({ day, month, year }, endOfDay) => {
  if (day === "" || month === "" || year === "") {
    return undefined;
  }
  const [d, m, y] = [day, month, year].map(Number);
  if (![d, m, y].every(Number.isInteger) || !isRealDate(d, m, y)) {
    return undefined;
  }
  const monthIndex = m - MONTH_INDEX_OFFSET;
  const startOfDay = new Date(Date.UTC(y, monthIndex, d));
  if (!endOfDay) {
    return startOfDay;
  }

  // "date to" is inclusive of the whole day: the last millisecond before the next
  // day begins. Date.UTC rolls the day over month and year ends correctly.
  const startOfNextDay = new Date(Date.UTC(y, monthIndex, d + ONE_DAY));
  return new Date(startOfNextDay.getTime() - ONE_MILLISECOND);
};

/**
 * Builds a date filter from raw day/month/year form parts.
 *
 * @param {{ day?: string, month?: string, year?: string }} [parts] - the raw values from the date input.
 * @param {{ endOfDay?: boolean }} [options] - set `endOfDay` for an inclusive "date to" bound (last millisecond of the day).
 * @returns {{ value: Date | undefined, items: Array<{ name: string, classes: string, value: string }> }}
 *   `value` is the parsed UTC date, or undefined when the parts are empty or not a real date;
 *   `items` are the govukDateInput items used to re-populate the form.
 */
export const buildDateFilter = (parts, { endOfDay = false } = {}) => {
  const { day, month, year } = { ...emptyDateParts, ...parts };
  return {
    value: toDate({ day, month, year }, endOfDay),
    items: [
      { name: "day", classes: "govuk-input--width-2", value: day },
      { name: "month", classes: "govuk-input--width-2", value: month },
      { name: "year", classes: "govuk-input--width-4", value: year },
    ],
  };
};

/**
 * Resolves the date range to send to the search API.
 *
 * An inverted range (to before from) is meaningless, so neither bound is sent.
 * Either bound may be undefined when its date was empty or invalid.
 *
 * @param {{ value: Date | undefined }} fromFilter - the "date from" filter from {@link buildDateFilter}.
 * @param {{ value: Date | undefined }} toFilter - the "date to" filter from {@link buildDateFilter}.
 * @returns {{ dateFrom: Date | undefined, dateTo: Date | undefined }} the bounds to pass to the API.
 */
export const resolveDateRange = (fromFilter, toFilter) => {
  const { value: dateFrom } = fromFilter;
  const { value: dateTo } = toFilter;
  if (dateFrom && dateTo && dateTo < dateFrom) {
    return { dateFrom: undefined, dateTo: undefined };
  }
  return { dateFrom, dateTo };
};
