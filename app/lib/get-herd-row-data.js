import { upperFirstLetter } from "./display-helper.js";
import { getHerdReasonsText } from "./get-herd-reasons-text.js";

export const getHerdRowData = (herd, isSheep) => {
  const flockOrHerdWord = isSheep ? "flock" : "herd";

  const herdInfo = herd ?? {
    name: `Unnamed ${flockOrHerdWord}`,
    cph: "-",
  };
  const isOnlyHerd = herdInfo.reasons?.includes("onlyHerd") ? "Yes" : "No";
  const reasonText = getHerdReasonsText(herdInfo.reasons);
  const herdName = {
    key: { text: `${upperFirstLetter(flockOrHerdWord)} name` },
    value: {
      html: herdInfo.name ?? `Unnamed ${flockOrHerdWord}`,
    },
  };
  const herdCph = {
    key: { text: `${upperFirstLetter(flockOrHerdWord)} CPH` },
    value: { html: herdInfo.cph },
  };
  const otherHerdsOnSbi = {
    key: { text: `Is this the only ${flockOrHerdWord} on this SBI?` },
    value: { html: herdInfo.reasons ? isOnlyHerd : "-" },
  };
  const reasonsForHerd = {
    key: { text: `Reasons the ${flockOrHerdWord} is separate` },
    value: {
      html: reasonText,
    },
  };

  return [herdName, herdCph, otherHerdsOnSbi, reasonsForHerd];
};
