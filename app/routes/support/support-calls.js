import wreck from "@hapi/wreck";
import { config } from "../../config/index.js";
import { StatusCodes } from "http-status-codes";

const applicationApiUri = config.get("applicationApiUri");
const apiKeys = config.get("apiKeys");
const paymentProxyApiUri = config.get("paymentProxyApiUri");
const messageGeneratorApiUri = config.get("messageGeneratorApiUri");
const documentGeneratorApiUri = config.get("documentGeneratorApiUri");
const commsProxyApiUri = config.get("commsProxyApiUri");

const makeGetCall = async (url, notFoundMessage, logger) => {
  try {
    logger.info(`Call to ${url}`);
    const { payload } = await wreck.get(`${url}`, {
      json: true,
      headers: { "x-api-key": apiKeys.backofficeUiApiKey },
    });

    if (Array.isArray(payload) && payload.length === 0) {
      return notFoundMessage;
    }

    if (Array.isArray(payload?.data) && payload.data.length === 0) {
      return notFoundMessage;
    }

    return payload;
  } catch (error) {
    if (error.data?.res?.statusCode === StatusCodes.NOT_FOUND) {
      return notFoundMessage;
    }

    logger.error({ error, url });

    throw error;
  }
};

const makePostCall = async (url, notFoundMessage, logger) => {
  try {
    logger.info(`Call to ${url}`);
    const { payload } = await wreck.post(`${url}`, {
      json: true,
      headers: { "x-api-key": apiKeys.backofficeUiApiKey },
    });
    return payload;
  } catch (error) {
    if (error.data?.res?.statusCode === StatusCodes.NOT_FOUND) {
      return notFoundMessage;
    }

    logger.error({ error, url });

    throw error;
  }
};

export const getApplicationDocument = async (applicationReference, logger) => {
  return makeGetCall(
    `${applicationApiUri}/support/applications/${applicationReference}`,
    "No application found",
    logger,
  );
};

export const getClaimDocument = async (claimReference, logger) => {
  return makeGetCall(
    `${applicationApiUri}/support/claims/${claimReference}`,
    "No claim found",
    logger,
  );
};

export const getHerdDocument = async (herdId, logger) => {
  return makeGetCall(`${applicationApiUri}/support/herds/${herdId}`, "No herd found", logger);
};

export const getPaymentDocument = async (claimReference, logger) => {
  return makeGetCall(
    `${paymentProxyApiUri}/payments/${claimReference}`,
    "No payment found",
    logger,
  );
};

export const getPaymentDocumentWithRefresh = async (claimReference, logger) => {
  await makePostCall(
    `${paymentProxyApiUri}/support/payments/${claimReference}/request-status`,
    "No payment status found",
    logger,
  );
  return getPaymentDocument(claimReference, logger);
};

export const getAgreementMessagesDocument = async (agreementReference, logger) => {
  return makeGetCall(
    `${messageGeneratorApiUri}/support/message-generation?agreementReference=${agreementReference}`,
    "No agreement messages found",
    logger,
  );
};

export const getClaimMessagesDocument = async (claimReference, logger) => {
  return makeGetCall(
    `${messageGeneratorApiUri}/support/message-generation?claimReference=${claimReference}`,
    "No claim messages found",
    logger,
  );
};

export const getAgreementLogsDocument = async (agreementReference, logger) => {
  return makeGetCall(
    `${documentGeneratorApiUri}/support/document-logs?agreementReference=${agreementReference}`,
    "No agreement logs found",
    logger,
  );
};

export const getAgreementCommsDocument = async (agreementReference, logger) => {
  return makeGetCall(
    `${commsProxyApiUri}/support/comms-requests?agreementReference=${agreementReference}`,
    "No agreement comms found",
    logger,
  );
};

export const getClaimCommsDocument = async (claimReference, logger) => {
  return makeGetCall(
    `${commsProxyApiUri}/support/comms-requests?claimReference=${claimReference}`,
    "No claim comms found",
    logger,
  );
};

const makeGetQueueMessagesCall = async (url, logger) => {
  try {
    logger.info(`Retrieving queue messages from: ${url}`);
    const { payload } = await wreck.get(`${url}`, {
      json: true,
      headers: { "x-api-key": apiKeys.backofficeUiApiKey },
    });

    if (Array.isArray(payload) && payload.length === 0) {
      return "Messages not found";
    }

    return payload;
  } catch (error) {
    if (error.data?.res?.statusCode === StatusCodes.NOT_FOUND) {
      return "Queue not found";
    }

    logger.error({ error, url });

    throw error;
  }
};

export const getApplicationQueueMessages = async (queueUrl, limit, logger) => {
  return makeGetQueueMessagesCall(
    `${applicationApiUri}/support/queue-messages?queueUrl=${queueUrl}&limit=${limit}`,
    logger,
  );
};

export const getDocumentGeneratorQueueMessages = async (queueUrl, limit, logger) => {
  return makeGetQueueMessagesCall(
    `${documentGeneratorApiUri}/support/queue-messages?queueUrl=${queueUrl}&limit=${limit}`,
    logger,
  );
};

export const getMessageGeneratorQueueMessages = async (queueUrl, limit, logger) => {
  return makeGetQueueMessagesCall(
    `${messageGeneratorApiUri}/support/queue-messages?queueUrl=${queueUrl}&limit=${limit}`,
    logger,
  );
};

export const getPaymentProxyQueueMessages = async (queueUrl, limit, logger) => {
  return makeGetQueueMessagesCall(
    `${paymentProxyApiUri}/support/queue-messages?queueUrl=${queueUrl}&limit=${limit}`,
    logger,
  );
};

export const getSfdCommsProxyQueueMessages = async (queueUrl, limit, logger) => {
  return makeGetQueueMessagesCall(
    `${commsProxyApiUri}/support/queue-messages?queueUrl=${queueUrl}&limit=${limit}`,
    logger,
  );
};

const makeIsDlqCall = async (url, logger) => {
  try {
    logger.info(`Checking if dead-letter queue: ${url}`);
    const { payload } = await wreck.get(`${url}`, {
      json: true,
      headers: { "x-api-key": apiKeys.backofficeUiApiKey },
    });

    return Boolean(payload?.isDlq);
  } catch (error) {
    // A 404 means the service has not implemented the endpoint (or the queue is
    // unknown) — either way we treat the queue as not a dead-letter queue.
    if (error.data?.res?.statusCode === StatusCodes.NOT_FOUND) {
      return false;
    }

    logger.error({ error, url });

    throw error;
  }
};

export const getApplicationQueueIsDlq = async (queueUrl, logger) => {
  return makeIsDlqCall(
    `${applicationApiUri}/support/queue-messages/is-dlq?queueUrl=${queueUrl}`,
    logger,
  );
};

export const getDocumentGeneratorQueueIsDlq = async (queueUrl, logger) => {
  return makeIsDlqCall(
    `${documentGeneratorApiUri}/support/queue-messages/is-dlq?queueUrl=${queueUrl}`,
    logger,
  );
};

export const getMessageGeneratorQueueIsDlq = async (queueUrl, logger) => {
  return makeIsDlqCall(
    `${messageGeneratorApiUri}/support/queue-messages/is-dlq?queueUrl=${queueUrl}`,
    logger,
  );
};

export const getPaymentProxyQueueIsDlq = async (queueUrl, logger) => {
  return makeIsDlqCall(
    `${paymentProxyApiUri}/support/queue-messages/is-dlq?queueUrl=${queueUrl}`,
    logger,
  );
};

export const getSfdCommsProxyQueueIsDlq = async (queueUrl, logger) => {
  return makeIsDlqCall(
    `${commsProxyApiUri}/support/queue-messages/is-dlq?queueUrl=${queueUrl}`,
    logger,
  );
};

const makeApplyQueueActionsCall = async (url, queueUrl, actions, logger) => {
  try {
    logger.info(`Applying queue actions: ${url}`);
    const { payload } = await wreck.post(`${url}`, {
      json: true,
      headers: {
        "x-api-key": apiKeys.backofficeUiApiKey,
        "content-type": "application/json",
      },
      payload: JSON.stringify({ queueUrl, actions }),
    });

    return payload;
  } catch (error) {
    if (error.data?.res?.statusCode === StatusCodes.NOT_FOUND) {
      return "Queue not found";
    }

    logger.error({ error, url });

    throw error;
  }
};

export const applyApplicationQueueActions = async (queueUrl, actions, logger) => {
  return makeApplyQueueActionsCall(
    `${applicationApiUri}/support/queue-messages/actions`,
    queueUrl,
    actions,
    logger,
  );
};

export const applyDocumentGeneratorQueueActions = async (queueUrl, actions, logger) => {
  return makeApplyQueueActionsCall(
    `${documentGeneratorApiUri}/support/queue-messages/actions`,
    queueUrl,
    actions,
    logger,
  );
};

export const applyMessageGeneratorQueueActions = async (queueUrl, actions, logger) => {
  return makeApplyQueueActionsCall(
    `${messageGeneratorApiUri}/support/queue-messages/actions`,
    queueUrl,
    actions,
    logger,
  );
};

export const applyPaymentProxyQueueActions = async (queueUrl, actions, logger) => {
  return makeApplyQueueActionsCall(
    `${paymentProxyApiUri}/support/queue-messages/actions`,
    queueUrl,
    actions,
    logger,
  );
};

export const applySfdCommsProxyQueueActions = async (queueUrl, actions, logger) => {
  return makeApplyQueueActionsCall(
    `${commsProxyApiUri}/support/queue-messages/actions`,
    queueUrl,
    actions,
    logger,
  );
};
