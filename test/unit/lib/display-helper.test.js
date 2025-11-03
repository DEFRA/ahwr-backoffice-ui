import {
  upperFirstLetter,
  formattedDateToUk,
  formatSpecies,
  formatTypeOfVisit,
} from "../../../app/lib/display-helper";

describe("display-helper tests", () => {
  test.each([
    { input: "", expected: "" },
    { input: undefined, expected: "" },
    { input: "test", expected: "Test" },
    { input: "123", expected: "123" },
  ])("upperFirstLetter with $input", async ({ input, expected }) => {
    expect(upperFirstLetter(input)).toEqual(expected);
  });

  test.each([
    { input: "2024-12-15", expected: "15/12/2024" },
    { input: "1-1-2024", expected: "01/01/2024" },
  ])("formattedDateToUk with $input", async ({ input, expected }) => {
    expect(formattedDateToUk(input)).toEqual(expected);
  });

  test.each([
    { input: "beef", expected: "Beef cattle" },
    { input: "dairy", expected: "Dairy cattle" },
    { input: "sheep", expected: "Sheep" },
    { input: "pigs", expected: "Pigs" },
    { input: "other", expected: undefined },
    { input: undefined, expected: undefined },
  ])("formatSpecies with $input", async ({ input, expected }) => {
    expect(formatSpecies(input)).toEqual(expected);
  });

  test.each([
    { input: "E", expected: "Endemics" },
    { input: "R", expected: "Review" },
  ])("formatTypeOfVisit with $input", async ({ input, expected }) => {
    expect(formatTypeOfVisit(input)).toEqual(expected);
  });
});
