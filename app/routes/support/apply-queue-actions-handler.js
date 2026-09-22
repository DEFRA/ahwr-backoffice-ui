import Joi from "joi";
import {
  applyApplicationQueueActions,
  applyDocumentGeneratorQueueActions,
  applyMessageGeneratorQueueActions,
  applyPaymentProxyQueueActions,
  applySfdCommsProxyQueueActions,
} from "./support-calls.js";

const ACTION_FIELD_PREFIX = "action-";

const applyByService = new Map([
  ["ahwr-application-backend", applyApplicationQueueActions],
  ["ahwr-document-generator", applyDocumentGeneratorQueueActions],
  ["ahwr-message-generator", applyMessageGeneratorQueueActions],
  ["ahwr-payment-proxy", applyPaymentProxyQueueActions],
  ["ahwr-sfd-comms-proxy", applySfdCommsProxyQueueActions],
]);

const selectedActions = (payload) =>
  Object.entries(payload)
    .filter(([key, value]) => key.startsWith(ACTION_FIELD_PREFIX) && value !== "nothing")
    .map(([key, value]) => ({ id: key.slice(ACTION_FIELD_PREFIX.length), action: value }));

export const applyQueueActions = {
  action: "applyQueueActions",
  validation: Joi.object({
    action: Joi.string().required(),
    service: Joi.string().required(),
    queueUrl: Joi.string().required(),
  }).pattern(/^action-/, Joi.string().valid("delete", "reapply", "nothing")),
  handler: async (request, h) => {
    const { queueUrl, service } = request.payload;
    const logger = request.logger;
    const actions = selectedActions(request.payload);

    let applyResult;
    try {
      if (actions.length === 0) {
        applyResult = "No actions selected";
      } else {
        const result = await applyByService.get(service)(queueUrl, actions, logger);
        applyResult = JSON.stringify(result);
      }
    } catch (error) {
      logger.error({ error });
      applyResult = error.message;
    }

    return h.view("support", { applyResult, scrollTo: "applyResult" });
  },
  errorIdentifier: ["queueUrl", "service", "action-"],
  errorHandler: (receivedError) => ({
    ...receivedError,
    href: "#queueMessages",
  }),
};
