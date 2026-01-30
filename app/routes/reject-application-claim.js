import { permissions } from "../auth/permissions.js";
import { STATUS } from "ffc-ahwr-common-library";
import { buildUpdateClaimRoute } from "./claim/build-update-claim-route.js";

const { administrator, authoriser } = permissions;

export const rejectApplicationClaimRoute = buildUpdateClaimRoute({
  path: "/reject-application-claim",
  permissions: [administrator, authoriser],
  confirmValues: ["rejectClaim", "sentChecklist"],
  errorHref: "#reject",
  searchParam: "reject",
  status: STATUS.REJECTED,
});
