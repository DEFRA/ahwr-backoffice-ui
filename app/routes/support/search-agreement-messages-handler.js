import Joi from "joi";
import { getAgreementMessagesDocument } from "./support-calls.js";

export const searchAgreementMessages = {
  action: "searchAgreementMessages",
  validation: Joi.object({
    agreementMessagesReference: Joi.string().required(),
    action: Joi.string().required(),
  }),
  handler: async (request, h) => {
    const { agreementMessagesReference } = request.payload;
    const rawDocument = await getAgreementMessagesDocument(
      agreementMessagesReference,
      request.logger,
    );
    const agreementMessagesDocument = JSON.stringify(rawDocument);
    return h.view("support", { agreementMessagesDocument });
  },
  errorIdentifier: '"agreementMessagesReference"',
  errorHandler: (receivedError) => ({
    ...receivedError,
    message: "Agreement reference missing.",
    href: "#agreement-messages-reference",
  }),
};
