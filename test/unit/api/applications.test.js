import wreck from "@hapi/wreck";
import { config } from "../../../app/config";
import {
  getApplications,
  getApplication,
  updateApplicationStatus,
  updateApplicationData,
  redactPiiData,
  updateEligiblePiiRedaction,
  getOldWorldApplicationHistory,
} from "../../../app/api/applications";

jest.mock("@hapi/wreck");
jest.mock("../../../app/config");

const { applicationApiUri } = config;
const appRef = "ABC-1234";
const limit = 20;
const offset = 0;
const searchText = "";
const searchType = "";

describe("Application API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST getApplications", () => {
    it("returns applications when all is ok", async () => {
      const wreckResponse = {
        payload: {
          applications: [{}, {}],
          total: 0,
        },
        res: {
          statusCode: 502,
        },
      };
      const expectedOptions = {
        payload: {
          search: { text: searchText, type: searchType },
          limit,
          offset,
        },
        json: true,
        headers: { "x-api-key": process.env.BACKEND_API_KEY },
      };
      wreck.post = jest.fn().mockResolvedValueOnce(wreckResponse);
      const response = await getApplications(searchType, searchText, limit, offset);

      expect(response).toEqual(wreckResponse.payload);
      expect(wreck.post).toHaveBeenCalledTimes(1);
      expect(wreck.post).toHaveBeenCalledWith(
        `${applicationApiUri}/applications/search`,
        expectedOptions,
      );
    });

    it("throws error when error raised", async () => {
      const filter = [];
      const sort = "ASC";

      const expectedOptions = {
        payload: {
          search: { text: searchText, type: searchType },
          limit,
          offset,
          filter,
          sort,
        },
        json: true,
        headers: { "x-api-key": process.env.BACKEND_API_KEY },
      };
      wreck.post = jest.fn().mockRejectedValueOnce("getApplications boom");
      const logger = { error: jest.fn() };

      expect(async () => {
        await getApplications(searchType, searchText, limit, offset, filter, sort, logger);
      }).rejects.toBe("getApplications boom");
      expect(wreck.post).toHaveBeenCalledTimes(1);
      expect(wreck.post).toHaveBeenCalledWith(
        `${applicationApiUri}/applications/search`,
        expectedOptions,
      );
    });
  });

  describe("GET getApplications", () => {
    it("returns null application on bad gateway", async () => {
      const wreckResponse = {
        payload: null,
        res: {
          statusCode: 502,
        },
      };
      const expectedOptions = { json: true, headers: { "x-api-key": process.env.BACKEND_API_KEY } };
      wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
      const response = await getApplication(appRef);

      expect(response).toEqual(wreckResponse.payload);
      expect(wreck.get).toHaveBeenCalledTimes(1);
      expect(wreck.get).toHaveBeenCalledWith(
        `${applicationApiUri}/applications/${appRef}`,
        expectedOptions,
      );
    });

    it("returns an application when found", async () => {
      const applicationData = {
        reference: appRef,
      };
      const wreckResponse = {
        payload: applicationData,
        res: {
          statusCode: 200,
        },
      };
      const expectedOptions = { json: true, headers: { "x-api-key": process.env.BACKEND_API_KEY } };
      wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
      const response = await getApplication(appRef);

      expect(response).toEqual(wreckResponse.payload);
      expect(wreck.get).toHaveBeenCalledTimes(1);
      expect(wreck.get).toHaveBeenCalledWith(
        `${applicationApiUri}/applications/${appRef}`,
        expectedOptions,
      );
    });

    it("throws errors when error raised", async () => {
      const expectedOptions = { json: true, headers: { "x-api-key": process.env.BACKEND_API_KEY } };
      wreck.get = jest.fn().mockRejectedValueOnce("getApplication boom");
      const logger = { error: jest.fn() };

      expect(async () => {
        await getApplication(appRef, logger);
      }).rejects.toBe("getApplication boom");

      expect(wreck.get).toHaveBeenCalledTimes(1);
      expect(wreck.get).toHaveBeenCalledWith(
        `${applicationApiUri}/applications/${appRef}`,
        expectedOptions,
      );
    });
  });

  describe("PUT updateApplicationStatus", () => {
    it("throws error if error returned", async () => {
      const expectedOptions = {
        payload: {
          user: "test",
          status: 2,
        },
        json: true,
        headers: { "x-api-key": process.env.BACKEND_API_KEY },
      };
      wreck.put = jest.fn().mockRejectedValueOnce("updateApplicationStatus boom");
      const logger = { error: jest.fn() };

      expect(async () => {
        await updateApplicationStatus(appRef, "test", 2, logger);
      }).rejects.toBe("updateApplicationStatus boom");

      expect(wreck.put).toHaveBeenCalledTimes(1);
      expect(wreck.put).toHaveBeenCalledWith(
        `${applicationApiUri}/applications/${appRef}`,
        expectedOptions,
      );
    });

    it("returns payload if everything is ok", async () => {
      const expectedOptions = {
        payload: {
          user: "test",
          status: 2,
        },
        json: true,
        headers: { "x-api-key": process.env.BACKEND_API_KEY },
      };
      const wreckResponse = {
        payload: {},
        res: {
          statusCode: 200,
        },
      };

      wreck.put = jest.fn().mockResolvedValueOnce(wreckResponse);
      const response = await updateApplicationStatus(appRef, "test", 2);

      expect(response).toEqual(wreckResponse.payload);
      expect(wreck.put).toHaveBeenCalledTimes(1);
      expect(wreck.put).toHaveBeenCalledWith(
        `${applicationApiUri}/applications/${appRef}`,
        expectedOptions,
      );
    });
  });

  describe("PUT updateApplicationData", () => {
    test("returns payload if everything is ok", async () => {
      const wreckResponse = {
        payload: {},
        res: {
          statusCode: 204,
        },
        json: true,
      };
      const logger = { error: jest.fn() };

      wreck.put = jest.fn().mockResolvedValueOnce(wreckResponse);

      const response = await updateApplicationData(
        appRef,
        {
          vetName: "John Doe",
          visitDate: "2025-01-17",
          vetRcvs: "123456",
        },
        "my note",
        "Admin",
        logger,
      );

      expect(response).toEqual(wreckResponse.payload);
    });

    test("throws error if error returned", async () => {
      const wreckResponse = {
        payload: {},
        res: {
          statusCode: 400,
        },
        json: true,
      };

      wreck.put = jest.fn().mockRejectedValueOnce(wreckResponse);
      const logger = { error: jest.fn() };

      expect(async () => {
        await updateApplicationData(
          appRef,
          {
            vetName: "John Doe",
            visitDate: "2025-01-17",
            vetRcvs: "123456",
          },
          "my note",
          "Admin",
          logger,
        );
      }).rejects.toEqual(wreckResponse);
    });
  });

  describe("POST redactPiiData", () => {
    const logger = {
      error: jest.fn(),
    };

    const endpoint = `${applicationApiUri}/redact/pii`;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return payload when request is successful", async () => {
      wreck.post.mockResolvedValue({ payload: {} });

      const result = await redactPiiData(logger);

      expect(wreck.post).toHaveBeenCalledWith(endpoint, {
        headers: { "x-api-key": process.env.BACKEND_API_KEY },
      });
      expect(result).toEqual({});
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("should log and rethrow error when request fails", async () => {
      const mockError = new Error("Request failed");
      wreck.post.mockRejectedValue(mockError);

      await expect(redactPiiData(logger)).rejects.toThrow("Request failed");

      expect(logger.error).toHaveBeenCalledWith({
        error: mockError,
        endpoint,
      });
    });
  });

  describe("PUT updateEligiblePiiRedaction", () => {
    const logger = {
      error: jest.fn(),
    };
    const reference = "IAHW-KJLI-2678";
    const endpoint = `${applicationApiUri}/applications/${reference}/eligible-pii-redaction`;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return payload when request is successful", async () => {
      wreck.put.mockResolvedValue({ payload: {} });

      const result = await updateEligiblePiiRedaction(
        reference,
        { updateEligiblePiiRedaction: true },
        "Reason for change",
        "John Doe",
        logger,
      );

      expect(wreck.put).toHaveBeenCalledWith(endpoint, {
        payload: {
          note: "Reason for change",
          updateEligiblePiiRedaction: true,
          user: "John Doe",
        },
        headers: { "x-api-key": process.env.BACKEND_API_KEY },
      });
      expect(result).toEqual({});
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("should log and rethrow error when request fails", async () => {
      const mockError = new Error("Request failed");
      wreck.put.mockRejectedValue(mockError);

      await expect(
        updateEligiblePiiRedaction(
          reference,
          { updateEligiblePiiRedaction: true },
          "Reason for change",
          "John Doe",
          logger,
        ),
      ).rejects.toThrow("Request failed");

      expect(logger.error).toHaveBeenCalledWith({
        error: mockError,
        endpoint,
      });
    });
  });

  describe("GET getOldWorldApplicationHistory", () => {
    it("returns payload if everything is ok", async () => {
      const applicationData = {
        reference: appRef,
      };
      const wreckResponse = {
        payload: applicationData,
        res: {
          statusCode: 200,
        },
      };
      const expectedOptions = { json: true, headers: { "x-api-key": process.env.BACKEND_API_KEY } };
      wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);
      const response = await getOldWorldApplicationHistory(appRef);

      expect(response).toEqual(wreckResponse.payload);
      expect(wreck.get).toHaveBeenCalledTimes(1);
      expect(wreck.get).toHaveBeenCalledWith(
        `${applicationApiUri}/applications/${appRef}/history`,
        expectedOptions,
      );
    });

    it("should throw errors", async () => {
      const expectedOptions = { json: true, headers: { "x-api-key": process.env.BACKEND_API_KEY } };
      wreck.get = jest.fn().mockRejectedValueOnce("getApplication boom");
      const logger = { error: jest.fn() };

      expect(async () => {
        await getOldWorldApplicationHistory(appRef, logger);
      }).rejects.toBe("getApplication boom");

      expect(wreck.get).toHaveBeenCalledTimes(1);
      expect(wreck.get).toHaveBeenCalledWith(
        `${applicationApiUri}/applications/${appRef}/history`,
        expectedOptions,
      );
    });
  });
});
