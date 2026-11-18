import { STATUS } from "ffc-ahwr-common-library";
import { config } from "../../config/index.js";

// Case officers (recommender / processor) and administrators (super admins are administrators) can submit a withdrawal request. Whoever submits can never be the one who authorises it; that is
// enforced when the request is reviewed (separate ticket), by comparing with the request's createdBy.
export const canWithdrawClaim = ({
  isAdministrator,
  isRecommender,
  isProcessor,
  status,
  isFlagged,
  isWithdrawalRequested = false,
}) =>
  (isAdministrator || isRecommender || isProcessor) &&
  status === STATUS.IN_CHECK &&
  config.get("withdrawClaimEnabled") &&
  !isFlagged &&
  !isWithdrawalRequested;
