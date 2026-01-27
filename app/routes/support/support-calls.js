import wreck from "@hapi/wreck";
import { config } from "../../config/index.js";
import { StatusCodes } from "http-status-codes";

const { applicationApiUri, paymentProxyApiUri, messageGeneratorApiUri, documentGeneratorApiUri } =
  config;
export const getApplicationDocument = async (applicationReference) => {
  try {
    const { payload } = await wreck.get(
      `${applicationApiUri}/support/applications/${applicationReference}`,
      {
        json: true,
      },
    );
    return payload;
  } catch (error) {
    if (error.data.res.statusCode === StatusCodes.NOT_FOUND) {
      return "No application found";
    }

    throw error;
  }
};

export const getClaimDocument = async (claimReference) => {
  try {
    const { payload } = await wreck.get(`${applicationApiUri}/support/claims/${claimReference}`, {
      json: true,
    });
    return payload;
  } catch (error) {
    if (error.data.res.statusCode === StatusCodes.NOT_FOUND) {
      return "No claim found";
    }

    throw error;
  }
};

export const getHerdDocument = async (herdId) => {
  try {
    const { payload } = await wreck.get(`${applicationApiUri}/support/herds/${herdId}`, {
      json: true,
    });
    return payload;
  } catch (error) {
    if (error.data.res.statusCode === StatusCodes.NOT_FOUND) {
      return "No herd found";
    }

    throw error;
  }
};

export const getPaymentDocument = async (paymentReference) => {
  try {
    const { payload } = await wreck.get(
      `${paymentProxyApiUri}/support/payments/${paymentReference}/request-status`,
      {
        json: true,
      },
    );
    return payload;
  } catch (error) {
    if (error.data.res.statusCode === StatusCodes.NOT_FOUND) {
      return "No payment found";
    }

    throw error;
  }
};

export const getAgreementMessagesDocument = async (agreementReference) => {
  try {
    const { payload } = await wreck.get(
      `${messageGeneratorApiUri}/support/message-generation?agreementReference=${agreementReference}`,
      {
        json: true,
      },
    );
    return payload;
  } catch (error) {
    if (error.data.res.statusCode === StatusCodes.NOT_FOUND) {
      return "No agreement messages found";
    }

    throw error;
  }
};

export const getClaimMessagesDocument = async (claimReference) => {
  try {
    const { payload } = await wreck.get(
      `${messageGeneratorApiUri}/support/message-generation?claimReference=${claimReference}`,
      {
        json: true,
      },
    );
    return payload;
  } catch (error) {
    if (error.data.res.statusCode === StatusCodes.NOT_FOUND) {
      return "No claim message found";
    }

    throw error;
  }
};

export const getAgreementLogsDocument = async (agreementReference) => {
  try {
    const { payload } = await wreck.get(
      `${documentGeneratorApiUri}/support/document-logs?agreementReference=${agreementReference}`,
      {
        json: true,
      },
    );
    return payload;
  } catch (error) {
    if (error.data.res.statusCode === StatusCodes.NOT_FOUND) {
      return "No Logs found";
    }

    throw error;
  }
};
