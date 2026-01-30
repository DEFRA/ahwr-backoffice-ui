import joi from "joi";
import { preSubmissionHandler } from "./utils/pre-submission-handler.js";
import { permissions } from "../auth/permissions.js";
import { STATUS } from "ffc-ahwr-common-library";
import { updateClaimFailAction, updateClaimHandler } from "./claim/update-claim-actions.js";

const { administrator, authoriser } = permissions;

export const rejectApplicationClaimRoute = {
  method: "post",
  path: "/reject-application-claim",
  options: {
    auth: { scope: [administrator, authoriser] },
    pre: [{ method: preSubmissionHandler }],
    validate: {
      payload: joi.object({
        confirm: joi
          .array()
          .items(
            joi.string().valid("rejectClaim").required(),
            joi.string().valid("sentChecklist").required(),
          )
          .required()
          .messages({
            "any.required": "Select all checkboxes",
            "array.base": "Select all checkboxes",
          }),
        reference: joi.string().valid().required(),
        page: joi.number().greater(0).default(1),
        returnPage: joi.string().optional().allow("").valid("agreement", "claims"),
      }),
      failAction: async (request, h, error) => {
        return updateClaimFailAction(request, h, error, "#reject", "reject");
      },
    },
    handler: async (request, h) => {
      return updateClaimHandler(request, h, STATUS.REJECTED);
    },
  },
};
