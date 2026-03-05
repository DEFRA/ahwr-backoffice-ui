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
    messageCount: Joi.number().integer().empty("").min(1).default(1),
    service: Joi.string().required(),
    action: Joi.string().required(),
  },
  handler: async (request, h) => {
    const { queueUrl, messageCount, service } = request.payload;
    const logger = request.logger;

    let queueMessages;
    try {
      const actionByService = new Map([
        [
          "ahwr-application-backend",
          () => getApplicationQueueMessages(queueUrl, messageCount, logger),
        ],
        [
          "ahwr-document-generator",
          () => getDocumentGeneratorQueueMessages(queueUrl, messageCount, logger),
        ],
        [
          "ahwr-message-generator",
          () => getMessageGeneratorQueueMessages(queueUrl, messageCount, logger),
        ],
        ["ahwr-payment-proxy", () => getPaymentProxyQueueMessages(queueUrl, messageCount, logger)],
        [
          "ahwr-sfd-comms-proxy",
          () => getSfdCommsProxyQueueMessages(queueUrl, messageCount, logger),
        ],
      ]);

      const result = await actionByService.get(service)();
      queueMessages = JSON.stringify(result);
    } catch (error) {
      logger.error({ error });
      queueMessages = error.message;
    }

    return h.view("support", { queueMessages, scrollTo: "queueMessages" });
  },
  errorIdentifier: '"queueUrl"',
  errorHandler: (receivedError) => ({
    ...receivedError,
    message: "Queue url missing",
    href: "#queue-url",
  }),
};
