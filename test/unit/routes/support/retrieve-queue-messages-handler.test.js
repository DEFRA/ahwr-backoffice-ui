import { retrieveQueueMessages } from "../../../../app/routes/support/retrieve-queue-messages-handler";
import { SQSClient } from "@aws-sdk/client-sqs";

jest.mock("@aws-sdk/client-sqs");
jest.mock("../../../../app/config/index.js", () => ({
  config: {
    aws: {
      region: "eu-west-1",
      endpointUrl: "http://localhost:4566",
    },
  },
}));

describe("retrieveQueueMessages.handler", () => {
  const sendMock = jest.fn();

  SQSClient.mockImplementation(() => ({
    send: sendMock,
  }));

  const request = {
    payload: {
      queueUrl: "queue-url",
      messageCount: 2,
    },
    logger: {
      info: jest.fn(),
      error: jest.fn(),
    },
  };

  const h = {
    view: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve messages and render them", async () => {
    sendMock.mockResolvedValue({
      Messages: [
        {
          MessageId: "1",
          Body: { sbi: "123456789", claimRef: "FUBC-JTTU-SDQ7" },
          Attributes: { attr: "value" },
          MessageAttributes: {
            eventType: { DataType: "String", StringValue: "uk.gov.ffc.ahwr.set.paid.status" },
          },
        },
      ],
    });

    await retrieveQueueMessages.handler(request, h);

    expect(SQSClient).toHaveBeenCalledWith({
      region: "eu-west-1",
      endpoint: "http://localhost:4566",
    });

    expect(sendMock).toHaveBeenCalled();

    expect(h.view).toHaveBeenCalledWith("support", {
      messagesDocument: JSON.stringify([
        {
          id: "1",
          body: { sbi: "123456789", claimRef: "FUBC-JTTU-SDQ7" },
          attributes: { attr: "value" },
          messageAttributes: {
            eventType: { DataType: "String", StringValue: "uk.gov.ffc.ahwr.set.paid.status" },
          },
        },
      ]),
      scrollTo: "messagesDocument",
    });

    expect(request.logger.error).not.toHaveBeenCalled();
  });

  it("should return empty array when no messages", async () => {
    sendMock.mockResolvedValue({});

    await retrieveQueueMessages.handler(request, h);

    expect(h.view).toHaveBeenCalledWith("support", {
      messagesDocument: JSON.stringify([]),
      scrollTo: "messagesDocument",
    });
  });

  it("should handle SQS errors and render error message", async () => {
    sendMock.mockRejectedValue(new Error("SQS failure"));

    await retrieveQueueMessages.handler(request, h);

    expect(request.logger.error).toHaveBeenCalled();

    expect(h.view).toHaveBeenCalledWith("support", {
      messagesDocument: "SQS failure",
      scrollTo: "messagesDocument",
    });
  });
});

describe("retrieveQueueMessages.errorHandler", () => {
  it("should override error message and href", () => {
    const result = retrieveQueueMessages.errorHandler({
      message: "original",
      extra: true,
    });

    expect(result).toEqual({
      message: "Queue url missing",
      extra: true,
      href: "#queue-url",
    });
  });
});
