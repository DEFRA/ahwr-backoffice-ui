import wreck from "@hapi/wreck";
import Boom from "@hapi/boom";
import {
  getAgreementCommsDocument,
  getAgreementLogsDocument,
  getAgreementMessagesDocument,
  getApplicationDocument,
  getClaimCommsDocument,
  getClaimDocument,
  getClaimMessagesDocument,
  getHerdDocument,
  getPaymentDocument,
  getPaymentDocumentWithRefresh,
} from "./support-calls";
import { StatusCodes } from "http-status-codes";

jest.mock("@hapi/wreck");
jest.mock("../../../app/config", () => ({
  config: {
    applicationApiUri: "http://ahwr-application-backend:3001/api",
    paymentProxyApiUri: "http://ahwr-payment-proxy:3001/api",
    messageGeneratorApiUri: "http://ahwr-message-generator:3001/api",
    documentGeneratorApiUri: "http://ahwr-document-generator:3001/api",
    commsProxyApiUri: "http://ahwr-sfd-comms-proxy:3001/api",
  },
}));

const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
};

describe("getApplicationDocument", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("calls with the expected parameters", async () => {
    const wreckResponse = {
      payload: {},
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const result = await getApplicationDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-application-backend:3001/api/support/applications/123",
      { json: true },
    );
    expect(result).toStrictEqual({});
  });

  it("returns correct not found message", async () => {
    wreck.get = jest.fn().mockImplementation(() => {
      throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
    });
    const result = await getApplicationDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-application-backend:3001/api/support/applications/123",
      { json: true },
    );
    expect(result).toStrictEqual("No application found");
  });

  it("logs error", async () => {
    const mockError = new Error("Request failed");
    wreck.get = jest.fn().mockRejectedValue(mockError);
    try {
      await getApplicationDocument("123", mockLogger);
      // This is to fail if no exception thrown
      throw new Error("Expected getApplicationDocument to throw");
    } catch (error) {
      expect(error).toBe(mockError);
      expect(wreck.get).toHaveBeenCalledWith(
        "http://ahwr-application-backend:3001/api/support/applications/123",
        { json: true },
      );
      expect(mockLogger.error).toHaveBeenCalled();
    }
  });
});

describe("getClaimDocument", () => {
  it("calls with the expected parameters", async () => {
    const wreckResponse = {
      payload: {},
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const result = await getClaimDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-application-backend:3001/api/support/claims/123",
      { json: true },
    );
    expect(result).toStrictEqual({});
  });

  it("returns correct not found message", async () => {
    wreck.get = jest.fn().mockImplementation(() => {
      throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
    });
    const result = await getClaimDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-application-backend:3001/api/support/claims/123",
      { json: true },
    );
    expect(result).toStrictEqual("No claim found");
  });

  it("logs error", async () => {
    const mockError = new Error("Request failed");
    wreck.get = jest.fn().mockRejectedValue(mockError);
    try {
      await getClaimDocument("123", mockLogger);
      // This is to fail if no exception thrown
      throw new Error("Expected getClaimDocument to throw");
    } catch (error) {
      expect(error).toBe(mockError);
      expect(wreck.get).toHaveBeenCalledWith(
        "http://ahwr-application-backend:3001/api/support/claims/123",
        { json: true },
      );
      expect(mockLogger.error).toHaveBeenCalled();
    }
  });
});

describe("getHerdDocument", () => {
  it("calls with the expected parameters", async () => {
    const wreckResponse = {
      payload: {},
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const result = await getHerdDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-application-backend:3001/api/support/herds/123",
      { json: true },
    );
    expect(result).toStrictEqual({});
  });

  it("returns correct not found message if empty array returned", async () => {
    const wreckResponse = {
      payload: [],
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const result = await getHerdDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-application-backend:3001/api/support/herds/123",
      { json: true },
    );
    expect(result).toStrictEqual("No herd found");
  });

  it("returns correct not found message", async () => {
    wreck.get = jest.fn().mockImplementation(() => {
      throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
    });
    const result = await getHerdDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-application-backend:3001/api/support/herds/123",
      { json: true },
    );
    expect(result).toStrictEqual("No herd found");
  });

  it("logs error", async () => {
    const mockError = new Error("Request failed");
    wreck.get = jest.fn().mockRejectedValue(mockError);
    try {
      await getHerdDocument("123", mockLogger);
      // This is to fail if no exception thrown
      throw new Error("Expected getHerdDocument to throw");
    } catch (error) {
      expect(error).toBe(mockError);
      expect(wreck.get).toHaveBeenCalledWith(
        "http://ahwr-application-backend:3001/api/support/herds/123",
        { json: true },
      );
      expect(mockLogger.error).toHaveBeenCalled();
    }
  });
});

describe("getPaymentDocumentWithRefresh", () => {
  it("calls with the expected parameters", async () => {
    const wreckResponse = {
      payload: {},
      res: {
        statusCode: 200,
      },
    };
    wreck.post = jest.fn().mockResolvedValueOnce(wreckResponse);
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const result = await getPaymentDocumentWithRefresh("123", mockLogger);
    expect(wreck.post).toHaveBeenCalledWith(
      "http://ahwr-payment-proxy:3001/api/support/payments/123/request-status",
      {
        json: true,
      },
    );
    expect(wreck.get).toHaveBeenCalledWith("http://ahwr-payment-proxy:3001/api/payments/123", {
      json: true,
    });
    expect(result).toStrictEqual({});
  });

  it("returns correct not found message", async () => {
    wreck.post = jest.fn().mockImplementation(() => {
      throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
    });
    wreck.get = jest.fn().mockImplementation(() => {
      throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
    });
    const result = await getPaymentDocumentWithRefresh("123", mockLogger);
    expect(wreck.post).toHaveBeenCalledWith(
      "http://ahwr-payment-proxy:3001/api/support/payments/123/request-status",
      {
        json: true,
      },
    );
    expect(wreck.get).toHaveBeenCalledWith("http://ahwr-payment-proxy:3001/api/payments/123", {
      json: true,
    });
    expect(result).toStrictEqual("No payment found");
  });

  it("logs error on get", async () => {
    const wreckResponse = {
      payload: {},
      res: {
        statusCode: 200,
      },
    };
    wreck.post = jest.fn().mockResolvedValueOnce(wreckResponse);
    const mockError = new Error("Request failed");
    wreck.get = jest.fn().mockRejectedValue(mockError);
    try {
      await getPaymentDocumentWithRefresh("123", mockLogger);
      // This is to fail if no exception thrown
      throw new Error("Expected getPaymenStatus to throw");
    } catch (error) {
      expect(error).toBe(mockError);
      expect(wreck.post).toHaveBeenCalledWith(
        "http://ahwr-payment-proxy:3001/api/support/payments/123/request-status",
        {
          json: true,
        },
      );
      expect(wreck.get).toHaveBeenCalledWith("http://ahwr-payment-proxy:3001/api/payments/123", {
        json: true,
      });
      expect(mockLogger.error).toHaveBeenCalled();
    }
  });
});

describe("getPaymentDocument", () => {
  it("calls with the expected parameters", async () => {
    const wreckResponse = {
      payload: {},
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const result = await getPaymentDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith("http://ahwr-payment-proxy:3001/api/payments/123", {
      json: true,
    });
    expect(result).toStrictEqual({});
  });

  it("returns correct not found message", async () => {
    wreck.get = jest.fn().mockImplementation(() => {
      throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
    });
    const result = await getPaymentDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith("http://ahwr-payment-proxy:3001/api/payments/123", {
      json: true,
    });
    expect(result).toStrictEqual("No payment found");
  });

  it("logs error", async () => {
    const mockError = new Error("Request failed");
    wreck.get = jest.fn().mockRejectedValue(mockError);
    try {
      await getPaymentDocument("123", mockLogger);
      // This is to fail if no exception thrown
      throw new Error("Expected getPaymenDocument to throw");
    } catch (error) {
      expect(error).toBe(mockError);
      expect(wreck.get).toHaveBeenCalledWith("http://ahwr-payment-proxy:3001/api/payments/123", {
        json: true,
      });
      expect(mockLogger.error).toHaveBeenCalled();
    }
  });
});

describe("getAgreementMessagesDocument", () => {
  it("calls with the expected parameters", async () => {
    const wreckResponse = {
      payload: {},
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const result = await getAgreementMessagesDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-message-generator:3001/api/support/message-generation?agreementReference=123",
      { json: true },
    );
    expect(result).toStrictEqual({});
  });

  it("returns correct not found message if no data returned", async () => {
    const wreckResponse = {
      payload: { data: [] },
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const result = await getAgreementMessagesDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-message-generator:3001/api/support/message-generation?agreementReference=123",
      { json: true },
    );
    expect(result).toStrictEqual("No agreement messages found");
  });

  it("returns correct not found message", async () => {
    wreck.get = jest.fn().mockImplementation(() => {
      throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
    });
    const result = await getAgreementMessagesDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-message-generator:3001/api/support/message-generation?agreementReference=123",
      { json: true },
    );
    expect(result).toStrictEqual("No agreement messages found");
  });

  it("logs error", async () => {
    const mockError = new Error("Request failed");
    wreck.get = jest.fn().mockRejectedValue(mockError);
    try {
      await getAgreementMessagesDocument("123", mockLogger);
      // This is to fail if no exception thrown
      throw new Error("Expected getAgreementMessagesDocument to throw");
    } catch (error) {
      expect(error).toBe(mockError);
      expect(wreck.get).toHaveBeenCalledWith(
        "http://ahwr-message-generator:3001/api/support/message-generation?agreementReference=123",
        { json: true },
      );
      expect(mockLogger.error).toHaveBeenCalled();
    }
  });
});

describe("getClaimMessagesDocument", () => {
  it("calls with the expected parameters", async () => {
    const wreckResponse = {
      payload: {},
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const result = await getClaimMessagesDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-message-generator:3001/api/support/message-generation?claimReference=123",
      { json: true },
    );
    expect(result).toStrictEqual({});
  });

  it("returns correct not found message if no data returned", async () => {
    const wreckResponse = {
      payload: { data: [] },
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const result = await getClaimMessagesDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-message-generator:3001/api/support/message-generation?claimReference=123",
      { json: true },
    );
    expect(result).toStrictEqual("No claim messages found");
  });

  it("returns correct not found message", async () => {
    wreck.get = jest.fn().mockImplementation(() => {
      throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
    });
    const result = await getClaimMessagesDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-message-generator:3001/api/support/message-generation?claimReference=123",
      { json: true },
    );
    expect(result).toStrictEqual("No claim messages found");
  });

  it("logs error", async () => {
    const mockError = new Error("Request failed");
    wreck.get = jest.fn().mockRejectedValue(mockError);
    try {
      await getClaimMessagesDocument("123", mockLogger);
      // This is to fail if no exception thrown
      throw new Error("Expected getClaimMessagesDocument to throw");
    } catch (error) {
      expect(error).toBe(mockError);
      expect(wreck.get).toHaveBeenCalledWith(
        "http://ahwr-message-generator:3001/api/support/message-generation?claimReference=123",
        { json: true },
      );
      expect(mockLogger.error).toHaveBeenCalled();
    }
  });
});

describe("getAgreementLogsDocument", () => {
  it("calls with the expected parameters", async () => {
    const wreckResponse = {
      payload: {},
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const result = await getAgreementLogsDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-document-generator:3001/api/support/document-logs?agreementReference=123",
      { json: true },
    );
    expect(result).toStrictEqual({});
  });

  it("returns correct not found message", async () => {
    wreck.get = jest.fn().mockImplementation(() => {
      throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
    });
    const result = await getAgreementLogsDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-document-generator:3001/api/support/document-logs?agreementReference=123",
      { json: true },
    );
    expect(result).toStrictEqual("No agreement logs found");
  });

  it("logs error", async () => {
    const mockError = new Error("Request failed");
    wreck.get = jest.fn().mockRejectedValue(mockError);
    try {
      await getAgreementLogsDocument("123", mockLogger);
      // This is to fail if no exception thrown
      throw new Error("Expected getAgreementLogsDocument to throw");
    } catch (error) {
      expect(error).toBe(mockError);
      expect(wreck.get).toHaveBeenCalledWith(
        "http://ahwr-document-generator:3001/api/support/document-logs?agreementReference=123",
        { json: true },
      );
      expect(mockLogger.error).toHaveBeenCalled();
    }
  });
});

describe("getAgreementCommsDocument", () => {
  it("calls with the expected parameters", async () => {
    const wreckResponse = {
      payload: {},
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const result = await getAgreementCommsDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-sfd-comms-proxy:3001/api/support/comms-requests?agreementReference=123",
      { json: true },
    );
    expect(result).toStrictEqual({});
  });

  it("returns correct not found message", async () => {
    wreck.get = jest.fn().mockImplementation(() => {
      throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
    });
    const result = await getAgreementCommsDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-sfd-comms-proxy:3001/api/support/comms-requests?agreementReference=123",
      { json: true },
    );
    expect(result).toStrictEqual("No agreement comms found");
  });

  it("logs error", async () => {
    const mockError = new Error("Request failed");
    wreck.get = jest.fn().mockRejectedValue(mockError);
    try {
      await getAgreementCommsDocument("123", mockLogger);
      // This is to fail if no exception thrown
      throw new Error("Expected getAgreementCommsDocument to throw");
    } catch (error) {
      expect(error).toBe(mockError);
      expect(wreck.get).toHaveBeenCalledWith(
        "http://ahwr-sfd-comms-proxy:3001/api/support/comms-requests?agreementReference=123",
        { json: true },
      );
      expect(mockLogger.error).toHaveBeenCalled();
    }
  });
});

describe("getClaimCommsDocument", () => {
  it("calls with the expected parameters", async () => {
    const wreckResponse = {
      payload: {},
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
    const result = await getClaimCommsDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-sfd-comms-proxy:3001/api/support/comms-requests?claimReference=123",
      { json: true },
    );
    expect(result).toStrictEqual({});
  });

  it("returns correct not found message", async () => {
    wreck.get = jest.fn().mockImplementation(() => {
      throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
    });
    const result = await getClaimCommsDocument("123", mockLogger);
    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-sfd-comms-proxy:3001/api/support/comms-requests?claimReference=123",
      { json: true },
    );
    expect(result).toStrictEqual("No claim comms found");
  });

  it("logs error", async () => {
    const mockError = new Error("Request failed");
    wreck.get = jest.fn().mockRejectedValue(mockError);
    try {
      await getClaimCommsDocument("123", mockLogger);
      // This is to fail if no exception thrown
      throw new Error("Expected getClaimCommsDocument to throw");
    } catch (error) {
      expect(error).toBe(mockError);
      expect(wreck.get).toHaveBeenCalledWith(
        "http://ahwr-sfd-comms-proxy:3001/api/support/comms-requests?claimReference=123",
        { json: true },
      );
      expect(mockLogger.error).toHaveBeenCalled();
    }
  });
});
