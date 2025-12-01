import joi from "joi";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { permissions } from "../auth/permissions.js";
import { updateEligiblePiiRedaction } from "../api/applications.js";
import { encodeErrorsForUI } from "./utils/encode-errors-for-ui.js";

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

        const panelID = "#update-eligible-pii-redaction";

        const errors = encodeErrorsForUI(error.details, panelID);
        const query = new URLSearchParams({
          page,
          updateEligiblePiiRedaction: "true",
          errors,
        });

        if (reference.startsWith("AHWR")) {
          return h.redirect(`/view-agreement/${reference}?${query.toString()}`).takeover();
        }

        return h.redirect(`/agreement/${reference}/claims?${query.toString()}`).takeover();
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
