import Joi from "joi";
import { getApplicationDocument } from "./support-calls.js";

export const searchApplication = {
  action: "searchApplication",
  validation: Joi.object({
    applicationReference: Joi.string().required(),
    action: Joi.string().required(),
  }),
  handler: async (request, h) => {
    const { applicationReference } = request.payload;
    const rawDocument = await getApplicationDocument(applicationReference, request.logger);
    const applicationDocument = JSON.stringify(rawDocument);
    return h.view("support", { applicationDocument });
  },
  errorIdentifier: '"applicationReference"',
  errorHandler: (receivedError) => ({
    ...receivedError,
    message: "Application reference missing.",
    href: "#application-reference",
  }),
};
