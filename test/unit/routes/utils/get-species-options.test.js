import { getSpeciesOptions } from "../../../../app/routes/utils/get-species-options.js";
import { SPECIES } from "../../../../app/constants/index.js";

describe("getSpeciesOptions", () => {
  test("returns the all, beef, dairy, sheep, pigs and poultry options in order", () => {
    const options = getSpeciesOptions(SPECIES.ALL);

    expect(options).toEqual([
      { value: SPECIES.ALL, text: "All species", selected: true },
      { value: SPECIES.BEEF, text: "Beef cattle", selected: false },
      { value: SPECIES.DAIRY, text: "Dairy cattle", selected: false },
      { value: SPECIES.SHEEP, text: "Sheep", selected: false },
      { value: SPECIES.PIGS, text: "Pigs", selected: false },
      { value: SPECIES.POULTRY, text: "Poultry", selected: false },
    ]);
  });

  test("marks the given species as selected", () => {
    const options = getSpeciesOptions(SPECIES.SHEEP);

    expect(options.find((option) => option.selected)).toEqual({
      value: SPECIES.SHEEP,
      text: "Sheep",
      selected: true,
    });
  });
});
