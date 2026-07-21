import { SPECIES } from "../../constants/index.js";

export const speciesLabels = Object.freeze({
  [SPECIES.ALL]: "All species",
  [SPECIES.BEEF]: "Beef cattle",
  [SPECIES.DAIRY]: "Dairy cattle",
  [SPECIES.SHEEP]: "Sheep",
  [SPECIES.PIGS]: "Pigs",
  [SPECIES.POULTRY]: "Poultry",
});

export const getSpeciesOptions = (selectedSpecies) =>
  Object.entries(speciesLabels).map(([value, text]) => ({
    value,
    text,
    selected: value === selectedSpecies,
  }));
