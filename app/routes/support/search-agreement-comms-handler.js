import Joi from "joi";
import { getAgreementCommsDocument } from "./support-calls.js";

export const searchAgreementComms = {
  action: "searchAgreementComms",
  validation: Joi.object({
    agreementCommsReference: Joi.string().trim().required(),
    action: Joi.string().required(),
  }),
  handler: async (request, h) => {
    const { agreementCommsReference } = request.payload;
    const rawDocument = await getAgreementCommsDocument(agreementCommsReference, request.logger);
    const agreementCommsDocument = JSON.stringify(rawDocument);
    return h.view("support", { agreementCommsDocument, scrollTo: "agreementCommsDocument" });
  },
  errorIdentifier: '"agreementCommsReference"',
  errorHandler: (receivedError) => ({
    ...receivedError,
    message: "Agreement reference missing.",
    href: "#agreement-comms-reference",
  }),
};
