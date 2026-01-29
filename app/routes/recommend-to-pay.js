import joi from "joi";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { preSubmissionHandler } from "./utils/pre-submission-handler.js";
import { encodeErrorsForUI } from "./utils/encode-errors-for-ui.js";
import { updateClaimStatus } from "../api/claims.js";
import { STATUS } from "ffc-ahwr-common-library";
import { permissions } from "../auth/permissions.js";

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
        const { page, reference, returnPage } = request.payload;
        request.logger.error({ error, reference });

        const errors = encodeErrorsForUI(error.details, "#recommend-to-pay");
        const query = new URLSearchParams({
          page,
          recommendToPay: "true",
          errors,
        });

        query.append("returnPage", returnPage);

        return h.redirect(`/view-claim/${reference}?${query.toString()}`).takeover();
      },
    },
    handler: async (request, h) => {
      const { page, reference, returnPage } = request.payload;
      const { name } = request.auth.credentials.account;

      // TODO - look at removing setBindings here
      request.logger.setBindings({ reference });

      await generateNewCrumb(request, h);
      const query = new URLSearchParams({ page });

      query.append("returnPage", returnPage);
      await updateClaimStatus(reference, name, STATUS.RECOMMENDED_TO_PAY, request.logger);

      return h.redirect(`/view-claim/${reference}?${query.toString()}`);
    },
  },
};
