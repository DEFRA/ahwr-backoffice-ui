import { STATUS } from "ffc-ahwr-common-library";
import { config } from "../../config/index.js";

// Case officers (recommender / processor / user) and administrators (super admins are administrators) can submit a withdrawal request. Whoever submits can never be the one who authorises it; that is
// enforced when the request is reviewed (separate ticket), by comparing with the request's createdBy.
const hasWithdrawRole = ({ isAdministrator, isRecommender, isProcessor, isUser }) =>
  isAdministrator || isRecommender || isProcessor || isUser;

// AHWR-2298 is behind withdrawalRequestEnabled. When off this is the original rule: only a super
// admin can withdraw an in-check, unflagged claim.
export const canWithdrawClaim = ({
  isSuperAdmin = false,
  isAdministrator,
  isRecommender,
  isProcessor,
  isUser,
  status,
  isFlagged,
  isWithdrawalRequested = false,
}) => {
  if (!config.get("withdrawClaimEnabled") || status !== STATUS.IN_CHECK || isFlagged) {
    return false;
  }

  if (!config.get("withdrawalRequestEnabled")) {
    return isSuperAdmin;
  }

  return (
    hasWithdrawRole({ isAdministrator, isRecommender, isProcessor, isUser }) &&
    !isWithdrawalRequested
  );
};
