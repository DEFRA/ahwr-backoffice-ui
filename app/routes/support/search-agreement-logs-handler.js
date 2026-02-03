import Joi from "joi";
import { getAgreementLogsDocument } from "./support-calls.js";

export const searchAgreementLogs = {
  action: "searchAgreementLogs",
  validation: Joi.object({
    agreementLogReference: Joi.string().trim().required(),
    action: Joi.string().required(),
  }),
  handler: async (request, h) => {
    const { agreementLogReference } = request.payload;
    const rawDocument = await getAgreementLogsDocument(agreementLogReference, request.logger);
    const agreementLogsDocument = JSON.stringify(rawDocument);
    return h.view("support", { agreementLogsDocument, scrollTo: "agreementLogsDocument" });
  },
  errorIdentifier: '"agreementLogReference"',
  errorHandler: (receivedError) => ({
    ...receivedError,
    message: "Agreement reference missing.",
    href: "#agreement-log-reference",
  }),
};
