import { permissions } from "../auth/permissions.js";
import { STATUS } from "ffc-ahwr-common-library";
import { buildUpdateClaimRoute } from "./claim/build-update-claim-route.js";

const { administrator, recommender, authoriser } = permissions;

export const moveToInCheckRoute = buildUpdateClaimRoute({
  path: "/move-to-in-check",
  permissions: [administrator, recommender, authoriser],
  confirmValues: ["recommendToMoveOnHoldClaim", "updateIssuesLog"],
  errorHref: "#move-to-in-check",
  searchParam: "moveToInCheck",
  status: STATUS.IN_CHECK,
});
