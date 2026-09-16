import { retrieveQueueMessages } from "./retrieve-queue-messages-handler.js";
import {
  getApplicationQueueMessages,
  getDocumentGeneratorQueueMessages,
  getMessageGeneratorQueueMessages,
  getPaymentProxyQueueMessages,
  getSfdCommsProxyQueueMessages,
  getApplicationQueueIsDlq,
} from "./support-calls.js";

jest.mock("./support-calls");

describe("retrieveQueueMessages.handler", () => {
  const request = {
    payload: {
      queueUrl: "queue-url",
      messageCount: 2,
      service: "ahwr-application-backend",
    },
    logger: {
      info: jest.fn(),
      error: jest.fn(),
    },
  };
  const messages = [
    {
      id: "1",
      body: { sbi: "123456789", claimRef: "FUBC-JTTU-SDQ7" },
      attributes: { attr: "value" },
      messageAttributes: {
        eventType: { DataType: "String", StringValue: "uk.gov.ffc.ahwr.set.paid.status" },
      },
    },
  ];

  const h = {
    view: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    { service: "ahwr-application-backend", action: getApplicationQueueMessages },
    { service: "ahwr-document-generator", action: getDocumentGeneratorQueueMessages },
    { service: "ahwr-message-generator", action: getMessageGeneratorQueueMessages },
    { service: "ahwr-payment-proxy", action: getPaymentProxyQueueMessages },
    { service: "ahwr-sfd-comms-proxy", action: getSfdCommsProxyQueueMessages },
  ])("should retrieve messages from $service and render them", async ({ service, action }) => {
    action.mockResolvedValueOnce(messages);

    await retrieveQueueMessages.handler(
      {
        ...request,
        payload: { ...request.payload, service },
      },
      h,
    );

    expect(action).toHaveBeenCalledWith("queue-url", 2, request.logger);
    expect(h.view).toHaveBeenCalledWith("support", {
      queueMessages: JSON.stringify(messages),
      scrollTo: "queueMessages",
    });
    expect(request.logger.error).not.toHaveBeenCalled();
  });

  it("renders the per-message action form when the queue is a dead-letter queue", async () => {
    getApplicationQueueMessages.mockResolvedValueOnce(messages);
    getApplicationQueueIsDlq.mockResolvedValueOnce(true);

    await retrieveQueueMessages.handler(request, h);

    expect(h.view).toHaveBeenCalledWith("support", {
      dlqMessages: messages,
      queueUrl: "queue-url",
      service: "ahwr-application-backend",
      isDlq: true,
      scrollTo: "queueMessages",
    });
    expect(request.logger.error).not.toHaveBeenCalled();
  });

  it("falls back to the plain view when a dead-letter queue has no messages", async () => {
    getApplicationQueueMessages.mockResolvedValueOnce([]);
    getApplicationQueueIsDlq.mockResolvedValueOnce(true);

    await retrieveQueueMessages.handler(request, h);

    expect(h.view).toHaveBeenCalledWith("support", {
      queueMessages: JSON.stringify([]),
      scrollTo: "queueMessages",
    });
  });

  it("should return empty array when no messages", async () => {
    getApplicationQueueMessages.mockResolvedValueOnce([]);

    await retrieveQueueMessages.handler(request, h);

    expect(h.view).toHaveBeenCalledWith("support", {
      queueMessages: JSON.stringify([]),
      scrollTo: "queueMessages",
    });
  });

  it("should handle errors from service and render error message", async () => {
    getApplicationQueueMessages.mockRejectedValue(new Error("Queue not found"));

    await retrieveQueueMessages.handler(request, h);

    expect(request.logger.error).toHaveBeenCalled();

    expect(h.view).toHaveBeenCalledWith("support", {
      queueMessages: "Queue not found",
      scrollTo: "queueMessages",
    });
  });
});

describe("retrieveQueueMessages.errorHandler", () => {
  it("should override error href", () => {
    const result = retrieveQueueMessages.errorHandler({
      message: "Queue url missing",
      extra: true,
    });

    expect(result).toEqual({
      message: "Queue url missing",
      extra: true,
      href: "#queue-url",
    });
  });
});
