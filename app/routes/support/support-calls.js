import wreck from "@hapi/wreck";
import { config } from "../../config/index.js";

const { applicationApiUri, paymentProxyApiUri, messageGeneratorApiUri } = config;
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
    if (error.data.res.statusCode === 404) {
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
    if (error.data.res.statusCode === 404) {
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
    if (error.data.res.statusCode === 404) {
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
    if (error.data.res.statusCode === 404) {
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
    if (error.data.res.statusCode === 404) {
      return "No agreement messages found";
    }

    throw error;
  }
};
