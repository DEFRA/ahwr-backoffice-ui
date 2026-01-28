import Joi from "joi";
import { getPaymentStatus } from "./support-calls.js";

export const searchPaymentStatus = {
  action: "searchPaymentStatus",
  validation: Joi.object({
    paymentStatusReference: Joi.string().required(),
    action: Joi.string().required(),
  }),
  handler: async (request, h) => {
    const { paymentStatusReference } = request.payload;
    const rawDocument = await getPaymentStatus(paymentStatusReference, request.logger);
    const paymentStatus = JSON.stringify(rawDocument);
    return h.view("support", { paymentStatus });
  },
  errorIdentifier: '"paymentStatusReference"',
  errorHandler: (receivedError) => ({
    ...receivedError,
    message: "Payment status reference missing.",
    href: "#payment-status-reference",
  }),
};
