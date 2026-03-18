import wreck from "@hapi/wreck";
import Boom from "@hapi/boom";
import {
  getAgreementCommsDocument,
  getAgreementLogsDocument,
  getAgreementMessagesDocument,
  getApplicationDocument,
  getApplicationQueueMessages,
  getClaimCommsDocument,
  getClaimDocument,
  getClaimMessagesDocument,
  getDocumentGeneratorQueueMessages,
  getHerdDocument,
  getMessageGeneratorQueueMessages,
  getPaymentDocument,
  getPaymentDocumentWithRefresh,
  getPaymentProxyQueueMessages,
  getSfdCommsProxyQueueMessages,
} from "./support-calls";
import { StatusCodes } from "http-status-codes";

jest.mock("@hapi/wreck");
jest.mock("../../../app/config", () => ({
  config: {
    apiKeys: { backofficeUiApiKey: "something" },
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
      { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
        { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
        { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
        { json: true, headers: { "x-api-key": "something" } },
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
        headers: { "x-api-key": "something" },
      },
    );
    expect(wreck.get).toHaveBeenCalledWith("http://ahwr-payment-proxy:3001/api/payments/123", {
      json: true,
      headers: { "x-api-key": "something" },
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
        headers: { "x-api-key": "something" },
      },
    );
    expect(wreck.get).toHaveBeenCalledWith("http://ahwr-payment-proxy:3001/api/payments/123", {
      json: true,
      headers: { "x-api-key": "something" },
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
          headers: { "x-api-key": "something" },
        },
      );
      expect(wreck.get).toHaveBeenCalledWith("http://ahwr-payment-proxy:3001/api/payments/123", {
        json: true,
        headers: { "x-api-key": "something" },
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
      headers: { "x-api-key": "something" },
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
      headers: { "x-api-key": "something" },
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
        headers: { "x-api-key": "something" },
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
      { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
        { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
        { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
        { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
        { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
      { json: true, headers: { "x-api-key": "something" } },
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
        { json: true, headers: { "x-api-key": "something" } },
      );
      expect(mockLogger.error).toHaveBeenCalled();
    }
  });
});

describe("getApplicationQueueMessages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const queueMessaages = [
    {
      id: "e8b834aa-aaad-40a6-85fc-a69ec0e6e6d6",
      body: '{"crn":"1060000000","sbi":"987654321","applicationReference":"IAHW-896I-FTN9","documentLocation":"987654321/IAHW-896I-FTN9.pdf","userType":"newUser"}',
      attributes: {
        SenderId: "000000000000",
        SentTimestamp: "1772709757010",
        ApproximateReceiveCount: "2",
        ApproximateFirstReceiveTimestamp: "1772710857588",
      },
    },
  ];

  it("calls service with the expected parameters and returns result", async () => {
    const wreckResponse = {
      payload: queueMessaages,
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);

    const result = await getApplicationQueueMessages("localhost:4566", 10, mockLogger);

    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-application-backend:3001/api/support/queue-messages?queueUrl=localhost:4566&limit=10",
      { json: true, headers: { "x-api-key": "something" } },
    );
    expect(result).toStrictEqual(queueMessaages);
  });

  it("returns not found message when service returns 404", async () => {
    wreck.get = jest.fn().mockImplementation(() => {
      throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
    });

    const result = await getApplicationQueueMessages("localhost:4566", 10, mockLogger);

    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-application-backend:3001/api/support/queue-messages?queueUrl=localhost:4566&limit=10",
      { json: true, headers: { "x-api-key": "something" } },
    );
    expect(result).toStrictEqual("Queue not found");
  });

  it("logs and throws error when service returns an error", async () => {
    const mockError = new Error("Request failed");
    wreck.get = jest.fn().mockRejectedValue(mockError);

    await expect(getApplicationQueueMessages("localhost:4566", 10, mockLogger)).rejects.toThrow(
      "Request failed",
    );

    expect(mockLogger.error).toHaveBeenCalledWith({
      error: mockError,
      url: "http://ahwr-application-backend:3001/api/support/queue-messages?queueUrl=localhost:4566&limit=10",
    });
  });
});

describe("getDocumentGeneratorQueueMessages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const queueMessaages = [
    {
      id: "e8b834aa-aaad-40a6-85fc-a69ec0e6e6d6",
      body: '{"crn":"1060000000","sbi":"987654321","applicationReference":"IAHW-896I-FTN9","documentLocation":"987654321/IAHW-896I-FTN9.pdf","userType":"newUser"}',
      attributes: {
        SenderId: "000000000000",
        SentTimestamp: "1772709757010",
        ApproximateReceiveCount: "2",
        ApproximateFirstReceiveTimestamp: "1772710857588",
      },
    },
  ];

  it("calls service with the expected parameters and returns result", async () => {
    const wreckResponse = {
      payload: queueMessaages,
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);

    const result = await getDocumentGeneratorQueueMessages("localhost:4566", 10, mockLogger);

    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-document-generator:3001/api/support/queue-messages?queueUrl=localhost:4566&limit=10",
      { json: true, headers: { "x-api-key": "something" } },
    );
    expect(result).toStrictEqual(queueMessaages);
  });

  it("returns not found message when service returns 404", async () => {
    wreck.get = jest.fn().mockImplementation(() => {
      throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
    });

    const result = await getDocumentGeneratorQueueMessages("localhost:4566", 10, mockLogger);

    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-document-generator:3001/api/support/queue-messages?queueUrl=localhost:4566&limit=10",
      { json: true, headers: { "x-api-key": "something" } },
    );
    expect(result).toStrictEqual("Queue not found");
  });

  it("logs and throws error when service returns an error", async () => {
    const mockError = new Error("Request failed");
    wreck.get = jest.fn().mockRejectedValue(mockError);

    await expect(
      getDocumentGeneratorQueueMessages("localhost:4566", 10, mockLogger),
    ).rejects.toThrow("Request failed");

    expect(mockLogger.error).toHaveBeenCalledWith({
      error: mockError,
      url: "http://ahwr-document-generator:3001/api/support/queue-messages?queueUrl=localhost:4566&limit=10",
    });
  });
});

describe("getMessageGeneratorQueueMessages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const queueMessaages = [
    {
      id: "e8b834aa-aaad-40a6-85fc-a69ec0e6e6d6",
      body: '{"crn":"1060000000","sbi":"987654321","applicationReference":"IAHW-896I-FTN9","documentLocation":"987654321/IAHW-896I-FTN9.pdf","userType":"newUser"}',
      attributes: {
        SenderId: "000000000000",
        SentTimestamp: "1772709757010",
        ApproximateReceiveCount: "2",
        ApproximateFirstReceiveTimestamp: "1772710857588",
      },
    },
  ];

  it("calls service with the expected parameters and returns result", async () => {
    const wreckResponse = {
      payload: queueMessaages,
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);

    const result = await getMessageGeneratorQueueMessages("localhost:4566", 10, mockLogger);

    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-message-generator:3001/api/support/queue-messages?queueUrl=localhost:4566&limit=10",
      { json: true, headers: { "x-api-key": "something" } },
    );
    expect(result).toStrictEqual(queueMessaages);
  });

  it("returns not found message when service returns 404", async () => {
    wreck.get = jest.fn().mockImplementation(() => {
      throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
    });

    const result = await getMessageGeneratorQueueMessages("localhost:4566", 10, mockLogger);

    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-message-generator:3001/api/support/queue-messages?queueUrl=localhost:4566&limit=10",
      { json: true, headers: { "x-api-key": "something" } },
    );
    expect(result).toStrictEqual("Queue not found");
  });

  it("logs and throws error when service returns an error", async () => {
    const mockError = new Error("Request failed");
    wreck.get = jest.fn().mockRejectedValue(mockError);

    await expect(
      getMessageGeneratorQueueMessages("localhost:4566", 10, mockLogger),
    ).rejects.toThrow("Request failed");

    expect(mockLogger.error).toHaveBeenCalledWith({
      error: mockError,
      url: "http://ahwr-message-generator:3001/api/support/queue-messages?queueUrl=localhost:4566&limit=10",
    });
  });
});

describe("getPaymentProxyQueueMessages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const queueMessaages = [
    {
      id: "e8b834aa-aaad-40a6-85fc-a69ec0e6e6d6",
      body: '{"crn":"1060000000","sbi":"987654321","applicationReference":"IAHW-896I-FTN9","documentLocation":"987654321/IAHW-896I-FTN9.pdf","userType":"newUser"}',
      attributes: {
        SenderId: "000000000000",
        SentTimestamp: "1772709757010",
        ApproximateReceiveCount: "2",
        ApproximateFirstReceiveTimestamp: "1772710857588",
      },
    },
  ];

  it("calls service with the expected parameters and returns result", async () => {
    const wreckResponse = {
      payload: queueMessaages,
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);

    const result = await getPaymentProxyQueueMessages("localhost:4566", 10, mockLogger);

    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-payment-proxy:3001/api/support/queue-messages?queueUrl=localhost:4566&limit=10",
      { json: true, headers: { "x-api-key": "something" } },
    );
    expect(result).toStrictEqual(queueMessaages);
  });

  it("returns not found message when service returns 404", async () => {
    wreck.get = jest.fn().mockImplementation(() => {
      throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
    });

    const result = await getPaymentProxyQueueMessages("localhost:4566", 10, mockLogger);

    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-payment-proxy:3001/api/support/queue-messages?queueUrl=localhost:4566&limit=10",
      { json: true, headers: { "x-api-key": "something" } },
    );
    expect(result).toStrictEqual("Queue not found");
  });

  it("logs and throws error when service returns an error", async () => {
    const mockError = new Error("Request failed");
    wreck.get = jest.fn().mockRejectedValue(mockError);

    await expect(getPaymentProxyQueueMessages("localhost:4566", 10, mockLogger)).rejects.toThrow(
      "Request failed",
    );

    expect(mockLogger.error).toHaveBeenCalledWith({
      error: mockError,
      url: "http://ahwr-payment-proxy:3001/api/support/queue-messages?queueUrl=localhost:4566&limit=10",
    });
  });
});

describe("getSfdCommsProxyQueueMessages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const queueMessaages = [
    {
      id: "e8b834aa-aaad-40a6-85fc-a69ec0e6e6d6",
      body: '{"crn":"1060000000","sbi":"987654321","applicationReference":"IAHW-896I-FTN9","documentLocation":"987654321/IAHW-896I-FTN9.pdf","userType":"newUser"}',
      attributes: {
        SenderId: "000000000000",
        SentTimestamp: "1772709757010",
        ApproximateReceiveCount: "2",
        ApproximateFirstReceiveTimestamp: "1772710857588",
      },
    },
  ];

  it("calls service with the expected parameters and returns result", async () => {
    const wreckResponse = {
      payload: queueMessaages,
      res: {
        statusCode: 200,
      },
    };
    wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);

    const result = await getSfdCommsProxyQueueMessages("localhost:4566", 10, mockLogger);

    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-sfd-comms-proxy:3001/api/support/queue-messages?queueUrl=localhost:4566&limit=10",
      { json: true, headers: { "x-api-key": "something" } },
    );
    expect(result).toStrictEqual(queueMessaages);
  });

  it("returns not found message when service returns 404", async () => {
    wreck.get = jest.fn().mockImplementation(() => {
      throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
    });

    const result = await getSfdCommsProxyQueueMessages("localhost:4566", 10, mockLogger);

    expect(wreck.get).toHaveBeenCalledWith(
      "http://ahwr-sfd-comms-proxy:3001/api/support/queue-messages?queueUrl=localhost:4566&limit=10",
      { json: true, headers: { "x-api-key": "something" } },
    );
    expect(result).toStrictEqual("Queue not found");
  });

  it("logs and throws error when service returns an error", async () => {
    const mockError = new Error("Request failed");
    wreck.get = jest.fn().mockRejectedValue(mockError);

    await expect(getSfdCommsProxyQueueMessages("localhost:4566", 10, mockLogger)).rejects.toThrow(
      "Request failed",
    );

    expect(mockLogger.error).toHaveBeenCalledWith({
      error: mockError,
      url: "http://ahwr-sfd-comms-proxy:3001/api/support/queue-messages?queueUrl=localhost:4566&limit=10",
    });
  });
});
