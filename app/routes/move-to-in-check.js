import joi from "joi";
import { preSubmissionHandler } from "./utils/pre-submission-handler.js";
import { permissions } from "../auth/permissions.js";
import { STATUS } from "ffc-ahwr-common-library";
import { updateClaimFailAction, updateClaimHandler } from "./claim/update-claim-actions.js";

const { administrator, recommender, authoriser } = permissions;

export const moveToInCheckRoute = {
  method: "post",
  path: "/move-to-in-check",
  options: {
    auth: { scope: [administrator, recommender, authoriser] },
    pre: [{ method: preSubmissionHandler }],
    validate: {
      payload: joi.object({
        confirm: joi
          .array()
          .items(
            joi.string().valid("recommendToMoveOnHoldClaim").required(),
            joi.string().valid("updateIssuesLog").required(),
          )
          .required()
          .messages({
            "any.required": "Select all checkboxes",
            "array.base": "Select all checkboxes",
          }),
        reference: joi.string().valid().required(),
        page: joi.number().greater(0).default(1),
        returnPage: joi.string().allow("").optional(),
      }),
      failAction: async (request, h, error) => {
        return updateClaimFailAction(request, h, error, "#move-to-in-check", "moveToInCheck");
      },
    },
    handler: async (request, h) => {
      return updateClaimHandler(request, h, STATUS.RECOMMENDED_TO_PAY);
    },
  },
};
