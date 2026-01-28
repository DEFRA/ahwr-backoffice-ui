import Joi from "joi";
import { getHerdDocument } from "./support-calls.js";

export const searchHerd = {
  action: "searchHerd",
  validation: Joi.object({
    herdId: Joi.string().required(),
    action: Joi.string().required(),
  }),
  handler: async (request, h) => {
    const { herdId } = request.payload;
    const rawDocument = await getHerdDocument(herdId);
    const herdDocument = JSON.stringify(rawDocument);
    return h.view("support", { herdDocument });
  },
  errorIdentifier: '"herdId"',
  errorHandler: (receivedError) => ({
    ...receivedError,
    message: "Herd id missing.",
    href: "#herd-id",
  }),
};
