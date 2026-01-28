import Joi from "joi";
import { getAgreementMessagesDocument } from "./support-calls";

export const searchAgreementMessages = {
  action: "searchAgreementMessages",
  validation: Joi.object({
    agreementMessageReference: Joi.string().required(),
    action: Joi.string().required(),
  }),
  handler: async (request, h) => {
    const { agreementMessagesReference } = request.payload;
    const rawDocument = await getAgreementMessagesDocument(agreementMessagesReference);
    const agreementMessagesDocument = JSON.stringify(rawDocument);
    return h.view("support", { agreementMessagesDocument });
  },
  errorIdentifier: '"agreementMessageReference"',
  errorHandler: (receivedError) => ({
    ...receivedError,
    message: "Agreement reference missing.",
    href: "#agreement-message-reference",
  }),
};
