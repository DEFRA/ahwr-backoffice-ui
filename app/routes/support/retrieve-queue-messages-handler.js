import Joi from "joi";
import {
  getApplicationQueueMessages,
  getDocumentGeneratorQueueMessages,
  getMessageGeneratorQueueMessages,
  getPaymentProxyQueueMessages,
  getSfdCommsProxyQueueMessages,
  getApplicationQueueIsDlq,
  getDocumentGeneratorQueueIsDlq,
  getMessageGeneratorQueueIsDlq,
  getPaymentProxyQueueIsDlq,
  getSfdCommsProxyQueueIsDlq,
} from "./support-calls.js";

const peekByService = new Map([
  ["ahwr-application-backend", getApplicationQueueMessages],
  ["ahwr-document-generator", getDocumentGeneratorQueueMessages],
  ["ahwr-message-generator", getMessageGeneratorQueueMessages],
  ["ahwr-payment-proxy", getPaymentProxyQueueMessages],
  ["ahwr-sfd-comms-proxy", getSfdCommsProxyQueueMessages],
]);

const isDlqByService = new Map([
  ["ahwr-application-backend", getApplicationQueueIsDlq],
  ["ahwr-document-generator", getDocumentGeneratorQueueIsDlq],
  ["ahwr-message-generator", getMessageGeneratorQueueIsDlq],
  ["ahwr-payment-proxy", getPaymentProxyQueueIsDlq],
  ["ahwr-sfd-comms-proxy", getSfdCommsProxyQueueIsDlq],
]);

export const retrieveQueueMessages = {
  action: "retrieveQueueMessages",
  validation: {
    queueUrl: Joi.string().trim().required(),
    messageCount: Joi.number().integer().empty("").min(1).max(10).default(1),
    service: Joi.string().required(),
    action: Joi.string().required(),
  },
  handler: async (request, h) => {
    const { queueUrl, messageCount, service } = request.payload;
    const logger = request.logger;

    try {
      const [result, isDlq] = await Promise.all([
        peekByService.get(service)(queueUrl, messageCount, logger),
        isDlqByService.get(service)(queueUrl, logger),
      ]);

      if (isDlq && Array.isArray(result) && result.length > 0) {
        return h.view("support", {
          dlqMessages: result,
          queueUrl,
          service,
          isDlq: true,
          scrollTo: "queueMessages",
        });
      }

      return h.view("support", {
        queueMessages: JSON.stringify(result),
        scrollTo: "queueMessages",
      });
    } catch (error) {
      logger.error({ error });
      return h.view("support", {
        queueMessages: error.message,
        scrollTo: "queueMessages",
      });
    }
  },
  errorIdentifier: ["queueUrl", "messageCount"],
  errorHandler: (receivedError) => ({
    ...receivedError,
    href: "#queue-url",
  }),
};
