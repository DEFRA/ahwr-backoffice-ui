import Joi from "joi";
import { getClaimCommsDocument } from "./support-calls.js";

export const searchClaimComms = {
  action: "searchClaimComms",
  validation: Joi.object({
    claimCommsReference: Joi.string().required(),
    action: Joi.string().required(),
  }),
  handler: async (request, h) => {
    const { claimCommsReference } = request.payload;
    const rawDocument = await getClaimCommsDocument(claimCommsReference, request.logger);
    const claimCommsDocument = JSON.stringify(rawDocument);
    return h.view("support", { claimCommsDocument });
  },
  errorIdentifier: '"claimCommsReference"',
  errorHandler: (receivedError) => ({
    ...receivedError,
    message: "Claim reference missing.",
    href: "#claim-comms-reference",
  }),
};
