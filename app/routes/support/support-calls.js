import wreck from "@hapi/wreck";
import { config } from "../../config/index.js";
import { StatusCodes } from "http-status-codes";

const { applicationApiUri, paymentProxyApiUri, messageGeneratorApiUri, documentGeneratorApiUri } =
  config;

const makeCall = async (url, notFoundMessage, logger) => {
  try {
    const { payload } = await wreck.get(`${url}`, {
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
  return makeCall(
    `${applicationApiUri}/support/applications/${applicationReference}`,
    "No application found",
    logger,
  );
};

export const getClaimDocument = async (claimReference, logger) => {
  return makeCall(
    `${applicationApiUri}/support/claims/${claimReference}`,
    "No claim found",
    logger,
  );
};

export const getHerdDocument = async (herdId, logger) => {
  return makeCall(`${applicationApiUri}/support/herds/${herdId}`, "No herd found", logger);
};

export const getPaymentDocument = async (paymentReference, logger) => {
  return makeCall(
    `${paymentProxyApiUri}/support/payments/${paymentReference}/request-status`,
    "No payment found",
    logger,
  );
};

export const getAgreementMessagesDocument = async (agreementReference, logger) => {
  return makeCall(
    `${messageGeneratorApiUri}/support/message-generation?agreementReference=${agreementReference}`,
    "No agreement messages found",
    logger,
  );
};

export const getClaimMessagesDocument = async (claimReference, logger) => {
  return makeCall(
    `${messageGeneratorApiUri}/support/message-generation?claimReference=${claimReference}`,
    "No claim messages found",
    logger,
  );
};

export const getAgreementLogsDocument = async (agreementReference, logger) => {
  return makeCall(
    `${documentGeneratorApiUri}/support/document-logs?agreementReference=${agreementReference}`,
    "No agreement logs found",
    logger,
  );
};
