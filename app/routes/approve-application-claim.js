import { permissions } from "../auth/permissions.js";
import { STATUS } from "ffc-ahwr-common-library";
import { buildUpdateClaimRoute } from "./claim/build-update-claim-route.js";

const { administrator, authoriser } = permissions;

export const approveApplicationClaimRoute = buildUpdateClaimRoute({
  path: "/approve-application-claim",
  permissions: [administrator, authoriser],
  confirmValues: ["approveClaim", "sentChecklist"],
  errorHref: "#authorise",
  searchParam: "approve",
  status: STATUS.READY_TO_PAY,
});
