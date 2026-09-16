import { applyQueueActions } from "./apply-queue-actions-handler.js";
import {
  applyApplicationQueueActions,
  applyDocumentGeneratorQueueActions,
  applyMessageGeneratorQueueActions,
  applyPaymentProxyQueueActions,
  applySfdCommsProxyQueueActions,
} from "./support-calls.js";

jest.mock("./support-calls");

describe("applyQueueActions.handler", () => {
  const logger = {
    info: jest.fn(),
    error: jest.fn(),
  };
  const h = {
    view: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    { service: "ahwr-application-backend", apply: applyApplicationQueueActions },
    { service: "ahwr-document-generator", apply: applyDocumentGeneratorQueueActions },
    { service: "ahwr-message-generator", apply: applyMessageGeneratorQueueActions },
    { service: "ahwr-payment-proxy", apply: applyPaymentProxyQueueActions },
    { service: "ahwr-sfd-comms-proxy", apply: applySfdCommsProxyQueueActions },
  ])(
    "applies the selected actions (dropping 'nothing') for $service and renders the result",
    async ({ service, apply }) => {
      const result = [{ id: "1", action: "delete", status: "done" }];
      apply.mockResolvedValueOnce(result);

      const request = {
        payload: {
          action: "applyQueueActions",
          service,
          queueUrl: "queue-url",
          "action-1": "delete",
          "action-2": "nothing",
          "action-3": "reapply",
        },
        logger,
      };

      await applyQueueActions.handler(request, h);

      expect(apply).toHaveBeenCalledWith(
        "queue-url",
        [
          { id: "1", action: "delete" },
          { id: "3", action: "reapply" },
        ],
        logger,
      );
      expect(h.view).toHaveBeenCalledWith("support", {
        applyResult: JSON.stringify(result),
        scrollTo: "applyResult",
      });
      expect(logger.error).not.toHaveBeenCalled();
    },
  );

  it("renders a message and calls no service when nothing is selected", async () => {
    const request = {
      payload: {
        action: "applyQueueActions",
        service: "ahwr-payment-proxy",
        queueUrl: "queue-url",
        "action-1": "nothing",
      },
      logger,
    };

    await applyQueueActions.handler(request, h);

    expect(applyPaymentProxyQueueActions).not.toHaveBeenCalled();
    expect(h.view).toHaveBeenCalledWith("support", {
      applyResult: "No actions selected",
      scrollTo: "applyResult",
    });
  });

  it("renders the error message when the service call fails", async () => {
    applyPaymentProxyQueueActions.mockRejectedValueOnce(new Error("boom"));

    const request = {
      payload: {
        action: "applyQueueActions",
        service: "ahwr-payment-proxy",
        queueUrl: "queue-url",
        "action-1": "delete",
      },
      logger,
    };

    await applyQueueActions.handler(request, h);

    expect(logger.error).toHaveBeenCalled();
    expect(h.view).toHaveBeenCalledWith("support", {
      applyResult: "boom",
      scrollTo: "applyResult",
    });
  });
});

describe("applyQueueActions.errorHandler", () => {
  it("overrides error href", () => {
    const result = applyQueueActions.errorHandler({ message: "bad", extra: true });

    expect(result).toEqual({ message: "bad", extra: true, href: "#queueMessages" });
  });
});
