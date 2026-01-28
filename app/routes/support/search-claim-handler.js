import Joi from "joi";
import { getClaimDocument } from "./support-calls.js";

export const searchClaim = {
  action: "searchClaim",
  validation: Joi.object({
    claimReference: Joi.string().required(),
    action: Joi.string().required(),
  }),
  handler: async (request, h) => {
    const { claimReference } = request.payload;
    const rawDocument = await getClaimDocument(claimReference);
    const claimDocument = JSON.stringify(rawDocument);
    return h.view("support", { claimDocument });
  },
  errorIdentifier: '"claimReference"',
  errorHandler: (receivedError) => ({
    ...receivedError,
    message: "Claim reference missing.",
    href: "#claim-reference",
  }),
};
