import joi from "joi";
import { updateApplicationStatus } from "../api/applications.js";
import { updateClaimStatus } from "../api/claims.js";
import { preSubmissionHandler } from "./utils/pre-submission-handler.js";
import { permissions } from "../auth/permissions.js";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { STATUS } from "ffc-ahwr-common-library";
import { encodeErrorsForUI } from "./utils/encode-errors-for-ui.js";

const { administrator, recommender, authoriser } = permissions;

export const moveToInCheckRoute = {
  method: "post",
  path: "/move-to-in-check",
  options: {
    auth: { scope: [administrator, recommender, authoriser] },
    pre: [{ method: preSubmissionHandler }],
    validate: {
      payload: joi.object({
        claimOrAgreement: joi.string().valid("claim", "agreement").required(),
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
        const { claimOrAgreement, page, reference, returnPage } = request.payload;

        request.logger.error({ error, reference });

        const errors = encodeErrorsForUI(error.details, "#move-to-in-check");
        const query = new URLSearchParams({
          page,
          moveToInCheck: "true",
          errors,
        });

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
        await updateClaimStatus(reference, name, STATUS.IN_CHECK, request.logger);
      } else {
        await updateApplicationStatus(reference, name, STATUS.IN_CHECK, request.logger);
      }

      return h.redirect(`/view-${claimOrAgreement}/${reference}?${query.toString()}`);
    },
  },
};
