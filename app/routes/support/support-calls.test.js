import wreck from "@hapi/wreck";
import Boom from "@hapi/boom";
import {
  getAgreementLogsDocument,
  getAgreementMessagesDocument,
  getApplicationDocument,
  getClaimDocument,
  getClaimMessagesDocument,
  getHerdDocument,
  getPaymentDocument,
} from "./support-calls";
import { StatusCodes } from "http-status-codes";

jest.mock("@hapi/wreck");
jest.mock("../../../app/config");

describe("Support calls", () => {
  describe("getApplicationDocument", () => {
    it("calls with the expected parameters", async () => {
      const wreckResponse = {
        payload: {},
        res: {
          statusCode: 200,
        },
      };
      wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
      const result = await getApplicationDocument("123");
      expect(wreck.get).toHaveBeenCalledWith("undefined/support/applications/123", { json: true });
      expect(result).toStrictEqual({});
    });

    it("returns correct not found message", async () => {
      wreck.get = jest.fn().mockImplementation(() => {
        throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
      });
      const result = await getApplicationDocument("123");
      expect(wreck.get).toHaveBeenCalledWith("undefined/support/applications/123", { json: true });
      expect(result).toStrictEqual("No application found");
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
      const result = await getClaimDocument("123");
      expect(wreck.get).toHaveBeenCalledWith("undefined/support/claims/123", { json: true });
      expect(result).toStrictEqual({});
    });

    it("returns correct not found message", async () => {
      wreck.get = jest.fn().mockImplementation(() => {
        throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
      });
      const result = await getClaimDocument("123");
      expect(wreck.get).toHaveBeenCalledWith("undefined/support/claims/123", { json: true });
      expect(result).toStrictEqual("No claim found");
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
      const result = await getHerdDocument("123");
      expect(wreck.get).toHaveBeenCalledWith("undefined/support/herds/123", { json: true });
      expect(result).toStrictEqual({});
    });

    it("returns correct not found message", async () => {
      wreck.get = jest.fn().mockImplementation(() => {
        throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
      });
      const result = await getHerdDocument("123");
      expect(wreck.get).toHaveBeenCalledWith("undefined/support/herds/123", { json: true });
      expect(result).toStrictEqual("No herd found");
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
      const result = await getPaymentDocument("123");
      expect(wreck.get).toHaveBeenCalledWith("undefined/support/payments/123/request-status", {
        json: true,
      });
      expect(result).toStrictEqual({});
    });

    it("returns correct not found message", async () => {
      wreck.get = jest.fn().mockImplementation(() => {
        throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
      });
      const result = await getPaymentDocument("123");
      expect(wreck.get).toHaveBeenCalledWith("undefined/support/payments/123/request-status", {
        json: true,
      });
      expect(result).toStrictEqual("No payment found");
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
      const result = await getAgreementMessagesDocument("123");
      expect(wreck.get).toHaveBeenCalledWith(
        "undefined/support/message-generation?agreementReference=123",
        { json: true },
      );
      expect(result).toStrictEqual({});
    });

    it("returns correct not found message", async () => {
      wreck.get = jest.fn().mockImplementation(() => {
        throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
      });
      const result = await getAgreementMessagesDocument("123");
      expect(wreck.get).toHaveBeenCalledWith(
        "undefined/support/message-generation?agreementReference=123",
        { json: true },
      );
      expect(result).toStrictEqual("No agreement messages found");
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
      const result = await getClaimMessagesDocument("123");
      expect(wreck.get).toHaveBeenCalledWith(
        "undefined/support/message-generation?claimReference=123",
        { json: true },
      );
      expect(result).toStrictEqual({});
    });

    it("returns correct not found message", async () => {
      wreck.get = jest.fn().mockImplementation(() => {
        throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
      });
      const result = await getClaimMessagesDocument("123");
      expect(wreck.get).toHaveBeenCalledWith(
        "undefined/support/message-generation?claimReference=123",
        { json: true },
      );
      expect(result).toStrictEqual("No claim messages found");
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
      const result = await getAgreementLogsDocument("123");
      expect(wreck.get).toHaveBeenCalledWith(
        "undefined/support/document-logs?agreementReference=123",
        { json: true },
      );
      expect(result).toStrictEqual({});
    });

    it("returns correct not found message", async () => {
      wreck.get = jest.fn().mockImplementation(() => {
        throw Boom.notFound("error", { res: { statusCode: StatusCodes.NOT_FOUND } });
      });
      const result = await getAgreementLogsDocument("123");
      expect(wreck.get).toHaveBeenCalledWith(
        "undefined/support/document-logs?agreementReference=123",
        { json: true },
      );
      expect(result).toStrictEqual("No agreement logs found");
    });
  });
});
