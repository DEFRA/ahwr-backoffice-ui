import { upperFirstLetter } from "../../lib/display-helper.js";
import { STATUS } from "ffc-ahwr-common-library";

const statusUpdateOptions = {
  IN_CHECK: STATUS.IN_CHECK,
  RECOMMENDED_TO_PAY: STATUS.RECOMMENDED_TO_PAY,
  RECOMMENDED_TO_REJECT: STATUS.RECOMMENDED_TO_REJECT,
};

export const getStatusUpdateOptions = (claimStatus) =>
  Object.entries(statusUpdateOptions)
    .filter(([_, value]) => value !== claimStatus)
    .map(([key, value]) => ({
      text: upperFirstLetter(key.toLowerCase()).replaceAll("_", " "),
      value,
    }));
