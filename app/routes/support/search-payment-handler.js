import Joi from "joi";
import { getPaymentDocument } from "./support-calls.js";

export const searchPayment = {
  action: "searchPayment",
  validation: Joi.object({
    paymentReference: Joi.string().required(),
    action: Joi.string().required(),
  }),
  handler: async (request, h) => {
    const { paymentReference } = request.payload;
    const rawDocument = await getPaymentDocument(paymentReference, request.logger);
    const paymentDocument = JSON.stringify(rawDocument);
    return h.view("support", { paymentDocument });
  },
  errorIdentifier: '"paymentReference"',
  errorHandler: (receivedError) => ({
    ...receivedError,
    message: "Payment reference missing.",
    href: "#payment-reference",
  }),
};
