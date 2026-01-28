import wreck from "@hapi/wreck";
import { config } from "../../config/index.js";
import { StatusCodes } from "http-status-codes";

const { applicationApiUri, paymentProxyApiUri, messageGeneratorApiUri, documentGeneratorApiUri } =
  config;

const makeCall = async (url, notFoundMessage) => {
  try {
    const { payload } = await wreck.get(`${url}`, {
      json: true,
    });
    return payload;
  } catch (error) {
    if (error.data.res.statusCode === StatusCodes.NOT_FOUND) {
      return notFoundMessage;
    }

    throw error;
  }
};

export const getApplicationDocument = async (applicationReference) => {
  return makeCall(
    `${applicationApiUri}/support/applications/${applicationReference}`,
    "No application found",
  );
};

export const getClaimDocument = async (claimReference) => {
  return makeCall(`${applicationApiUri}/support/claims/${claimReference}`, "No claim found");
};

export const getHerdDocument = async (herdId) => {
  return makeCall(`${applicationApiUri}/support/herds/${herdId}`, "No herd found");
};

export const getPaymentDocument = async (paymentReference) => {
  return makeCall(
    `${paymentProxyApiUri}/support/payments/${paymentReference}/request-status`,
    "No payment found",
  );
};

export const getAgreementMessagesDocument = async (agreementReference) => {
  return makeCall(
    `${messageGeneratorApiUri}/support/message-generation?agreementReference=${agreementReference}`,
    "No agreement messages found",
  );
};

export const getClaimMessagesDocument = async (claimReference) => {
  return makeCall(
    `${messageGeneratorApiUri}/support/message-generation?claimReference=${claimReference}`,
    "No claim messages found",
  );
};

export const getAgreementLogsDocument = async (agreementReference) => {
  return makeCall(
    `${documentGeneratorApiUri}/support/document-logs?agreementReference=${agreementReference}`,
    "No agreement logs found",
  );
};
