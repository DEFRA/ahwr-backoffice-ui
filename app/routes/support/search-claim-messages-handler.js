import Joi from "joi";
import { getClaimMessagesDocument } from "./support-calls.js";

export const searchClaimMessages = {
  action: "searchClaimMessages",
  validation: Joi.object({
    claimMessagesReference: Joi.string().required(),
    action: Joi.string().required(),
  }),
  handler: async (request, h) => {
    const { claimMessagesReference } = request.payload;
    const rawDocument = await getClaimMessagesDocument(claimMessagesReference, request.logger);
    const claimMessagesDocument = JSON.stringify(rawDocument);
    return h.view("support", { claimMessagesDocument, scrollTo: "claimMessagesDocument" });
  },
  errorIdentifier: '"claimMessagesReference"',
  errorHandler: (receivedError) => ({
    ...receivedError,
    message: "Claim reference missing.",
    href: "#claim-messages-reference",
  }),
};
