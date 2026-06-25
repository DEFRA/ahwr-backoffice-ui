import { formatErrorsForUI } from "../../../../app/routes/utils/format-errors-for-ui.js";

test("maps Joi error details to the view's text/href/key shape", () => {
  const joiErrors = [{ message: "Enter note", context: { key: "note" } }];

  const result = formatErrorsForUI(joiErrors, "#note");

  expect(result).toEqual([{ text: "Enter note", href: "#note", key: "note" }]);
});

test("applies the same href to every error", () => {
  const joiErrors = [
    { message: "Enter day", context: { key: "day" } },
    { message: "Enter month", context: { key: "month" } },
  ];

  const result = formatErrorsForUI(joiErrors, "#update-date-of-visit");

  expect(result).toEqual([
    { text: "Enter day", href: "#update-date-of-visit", key: "day" },
    { text: "Enter month", href: "#update-date-of-visit", key: "month" },
  ]);
});

test("returns an empty array when there are no errors", () => {
  expect(formatErrorsForUI([], "#note")).toEqual([]);
});
