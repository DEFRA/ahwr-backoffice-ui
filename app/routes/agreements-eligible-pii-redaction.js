import joi from "joi";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { permissions } from "../auth/permissions.js";
import { updateEligiblePiiRedaction } from "../api/applications.js";
import { formatErrorsForUI } from "./utils/format-errors-for-ui.js";
import { getFormFlags } from "./utils/get-form-flags.js";
import { buildViewAgreement } from "./view-agreement.js";
import { buildAgreement } from "./agreement.js";

const { administrator } = permissions;

export const updateEligiblePiiRedactionRoute = {
  method: "post",
  path: "/agreements/{ref}/eligible-pii-redaction",
  options: {
    auth: { scope: [administrator] },
    validate: {
      payload: joi
        .object({
          eligiblePiiRedaction: joi.string().required().messages({
            "any.required": "Select an option",
            "string.empty": "Select an option",
          }),
          note: joi.string().required().messages({
            "any.required": "Enter note",
            "string.empty": "Enter note",
          }),
          page: joi.number().greater(0).default(1),
          reference: joi.string().required(),
        })
        .required(),
      failAction: async (request, h, error) => {
        const { page, reference } = request.payload;

        request.logger.error({ error });

        const errors = formatErrorsForUI(error.details, "#update-eligible-pii-redaction");
        const formFlags = getFormFlags("updateEligiblePiiRedaction");

        if (reference.startsWith("AHWR")) {
          return (
            await buildViewAgreement(request, h, { reference, page, formFlags, errors })
          ).takeover();
        }

        return (
          await buildAgreement(request, h, { reference, page, formFlags, errors })
        ).takeover();
      },
    },
    handler: async (request, h) => {
      const { name } = request.auth.credentials.account;
      const { page, note, reference, eligiblePiiRedaction } = request.payload;

      // TODO - look at removing setBindings here
      request.logger.setBindings({ reference });

      await generateNewCrumb(request, h);
      const query = new URLSearchParams({ page });

      const agreementData = {
        eligiblePiiRedaction: eligiblePiiRedaction === "yes",
      };

      await updateEligiblePiiRedaction(reference, agreementData, note, name, request.logger);

      if (reference.startsWith("AHWR")) {
        return h.redirect(`/view-agreement/${reference}?${query.toString()}`);
      }

      return h.redirect(`/agreement/${reference}/claims?${query.toString()}`);
    },
  },
};
