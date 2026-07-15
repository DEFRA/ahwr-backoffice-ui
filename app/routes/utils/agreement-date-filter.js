const emptyParts = { day: "", month: "", year: "" };

export const extractDateParts = (payload, prefix) => ({
  day: payload?.[`${prefix}-day`] ?? "",
  month: payload?.[`${prefix}-month`] ?? "",
  year: payload?.[`${prefix}-year`] ?? "",
});

const isRealDate = (day, month, year) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
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
  // "date to" is inclusive of the whole day, so bound it to the last millisecond.
  return endOfDay
    ? new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999))
    : new Date(Date.UTC(y, m - 1, d));
};

export const buildAgreementDateFilter = (parts, { endOfDay = false } = {}) => {
  const { day, month, year } = { ...emptyParts, ...parts };
  return {
    value: toDate({ day, month, year }, endOfDay),
    items: [
      { name: "day", classes: "govuk-input--width-2", value: day },
      { name: "month", classes: "govuk-input--width-2", value: month },
      { name: "year", classes: "govuk-input--width-4", value: year },
    ],
  };
};
