import wreck from "@hapi/wreck";
import { config } from "../../config/index.js";
import { StatusCodes } from "http-status-codes";

const {
  applicationApiUri,
  paymentProxyApiUri,
  messageGeneratorApiUri,
  documentGeneratorApiUri,
  commsProxyApiUri,
} = config;

const makeGetCall = async (url, notFoundMessage, logger) => {
  try {
    logger.info(`Call to ${url}`);
    const { payload } = await wreck.get(`${url}`, {
      json: true,
    });

    if (Array.isArray(payload) && payload.length === 0) {
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
  makePostCall(
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
