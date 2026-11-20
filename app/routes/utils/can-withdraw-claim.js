import { STATUS } from "ffc-ahwr-common-library";
import { config } from "../../config/index.js";

// Case officers (recommender / processor / user) and administrators (super admins are administrators) can submit a withdrawal request. Whoever submits can never be the one who authorises it; that is
// enforced when the request is reviewed (separate ticket), by comparing with the request's createdBy.
const hasWithdrawRole = ({ isAdministrator, isRecommender, isProcessor, isUser }) =>
  isAdministrator || isRecommender || isProcessor || isUser;

export const canWithdrawClaim = ({
  isAdministrator,
  isRecommender,
  isProcessor,
  isUser,
  status,
  isFlagged,
  isWithdrawalRequested = false,
}) =>
  hasWithdrawRole({ isAdministrator, isRecommender, isProcessor, isUser }) &&
  status === STATUS.IN_CHECK &&
  config.get("withdrawClaimEnabled") &&
  !isFlagged &&
  !isWithdrawalRequested;
