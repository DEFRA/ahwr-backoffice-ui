import { permissions } from "../auth/permissions.js";
import { STATUS } from "ffc-ahwr-common-library";
import { buildUpdateClaimRoute } from "./claim/build-update-claim-route.js";

const { administrator, recommender } = permissions;

export const recommendToRejectRoute = buildUpdateClaimRoute({
  path: "/recommend-to-reject",
  permissions: [administrator, recommender],
  confirmValues: ["checkedAgainstChecklist", "sentChecklist"],
  errorHref: "#recommend-to-reject",
  searchParam: "recommendToReject",
  status: STATUS.RECOMMENDED_TO_REJECT,
});
