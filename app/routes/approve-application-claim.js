import joi from "joi";
import { permissions } from "../auth/permissions.js";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { preSubmissionHandler } from "./utils/pre-submission-handler.js";
import { updateClaimStatus } from "../api/claims.js";
import { encodeErrorsForUI } from "./utils/encode-errors-for-ui.js";
import { STATUS } from "ffc-ahwr-common-library";

const { administrator, authoriser } = permissions;

export const approveApplicationClaimRoute = {
  method: "post",
  path: "/approve-application-claim",
  options: {
    auth: { scope: [administrator, authoriser] },
    pre: [{ method: preSubmissionHandler }],
    validate: {
      payload: joi.object({
        confirm: joi
          .array()
          .items(
            joi.string().valid("approveClaim").required(),
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

        const errors = encodeErrorsForUI(error.details, "#authorise");
        const query = new URLSearchParams({ page, approve: "true", errors });

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
      await updateClaimStatus(reference, name, STATUS.READY_TO_PAY, request.logger);

      return h.redirect(`/view-claim/${reference}?${query.toString()}`);
    },
  },
};
