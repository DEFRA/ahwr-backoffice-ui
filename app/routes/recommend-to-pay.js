import { STATUS } from "ffc-ahwr-common-library";
import { permissions } from "../auth/permissions.js";
import { buildUpdateClaimRoute } from "./claim/build-update-claim-route.js";

const { administrator, recommender } = permissions;

export const recommendToPayRoute = buildUpdateClaimRoute({
  path: "/recommend-to-pay",
  permissions: [administrator, recommender],
  confirmValues: ["checkedAgainstChecklist", "sentChecklist"],
  errorHref: "#recommend-to-pay",
  searchParam: "recommendToPay",
  status: STATUS.RECOMMENDED_TO_PAY,
});
