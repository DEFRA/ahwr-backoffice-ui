import { STATUS } from "ffc-ahwr-common-library";
import { config } from "../../config/index.js";

export const canWithdrawClaim = ({
  isSuperAdmin,
  status,
  isFlagged,
  isWithdrawalRequested = false,
}) =>
  isSuperAdmin &&
  status === STATUS.IN_CHECK &&
  config.get("withdrawClaimEnabled") &&
  !isFlagged &&
  !isWithdrawalRequested;
