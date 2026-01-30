import joi from "joi";
import { preSubmissionHandler } from "./utils/pre-submission-handler.js";
import { STATUS } from "ffc-ahwr-common-library";
import { permissions } from "../auth/permissions.js";
import { updateClaimFailAction, updateClaimHandler } from "./claim/update-claim-actions.js";

const { administrator, recommender } = permissions;

export const recommendToPayRoute = {
  method: "post",
  path: "/recommend-to-pay",
  options: {
    auth: { scope: [administrator, recommender] },
    pre: [{ method: preSubmissionHandler }],
    validate: {
      payload: joi.object({
        confirm: joi
          .array()
          .items(
            joi.string().valid("checkedAgainstChecklist").required(),
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
        return updateClaimFailAction(request, h, error, "#recommend-to-pay", "recommendToPay");
      },
    },
    handler: async (request, h) => {
      return updateClaimHandler(request, h, STATUS.RECOMMENDED_TO_PAY);
    },
  },
};
