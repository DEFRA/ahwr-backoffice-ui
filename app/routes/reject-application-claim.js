import joi from "joi";
import { preSubmissionHandler } from "./utils/pre-submission-handler.js";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { updateClaimStatus } from "../api/claims.js";
import { encodeErrorsForUI } from "./utils/encode-errors-for-ui.js";
import { permissions } from "../auth/permissions.js";
import { STATUS } from "ffc-ahwr-common-library";

const { administrator, authoriser } = permissions;

export const rejectApplicationClaimRoute = {
  method: "post",
  path: "/reject-application-claim",
  options: {
    auth: { scope: [administrator, authoriser] },
    pre: [{ method: preSubmissionHandler }],
    validate: {
      payload: joi.object({
        claimOrAgreement: joi.string().valid("claim", "agreement").required(),
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
        const { claimOrAgreement, page, reference, returnPage } = request.payload;

        request.logger.error({ error, reference });

        const errors = encodeErrorsForUI(error.details, "#reject");
        const query = new URLSearchParams({ page, reject: "true", errors });

        if (claimOrAgreement === "claim") {
          query.append("returnPage", returnPage);
        }

        return h.redirect(`/view-${claimOrAgreement}/${reference}?${query.toString()}`).takeover();
      },
    },
    handler: async (request, h) => {
      const { claimOrAgreement, page, reference, returnPage } = request.payload;
      const { name } = request.auth.credentials.account;

      // TODO - look at removing setBindings here
      request.logger.setBindings({ reference });

      await generateNewCrumb(request, h);
      const query = new URLSearchParams({ page });

      if (claimOrAgreement === "claim") {
        query.append("returnPage", returnPage);
        await updateClaimStatus(reference, name, STATUS.REJECTED, request.logger);
      }

      return h.redirect(`/view-${claimOrAgreement}/${reference}?${query.toString()}`);
    },
  },
};
