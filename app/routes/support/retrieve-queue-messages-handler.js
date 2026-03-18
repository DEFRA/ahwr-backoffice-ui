import Joi from "joi";
import {
  getApplicationQueueMessages,
  getDocumentGeneratorQueueMessages,
  getMessageGeneratorQueueMessages,
  getPaymentProxyQueueMessages,
  getSfdCommsProxyQueueMessages,
} from "./support-calls.js";

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

    let queueMessages;
    try {
      const actionByService = new Map([
        ["ahwr-application-backend", getApplicationQueueMessages],
        ["ahwr-document-generator", getDocumentGeneratorQueueMessages],
        ["ahwr-message-generator", getMessageGeneratorQueueMessages],
        ["ahwr-payment-proxy", getPaymentProxyQueueMessages],
        ["ahwr-sfd-comms-proxy", getSfdCommsProxyQueueMessages],
      ]);

      const result = await actionByService.get(service)(queueUrl, messageCount, logger);
      queueMessages = JSON.stringify(result);
    } catch (error) {
      logger.error({ error });
      queueMessages = error.message;
    }

    return h.view("support", { queueMessages, scrollTo: "queueMessages" });
  },
  errorIdentifier: ['queueUrl', 'messageCount'],
  errorHandler: (receivedError) => ({
    ...receivedError,
    href: "#queue-url",
  }),
};
