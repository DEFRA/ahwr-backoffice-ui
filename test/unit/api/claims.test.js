import wreck from "@hapi/wreck";
import { claims } from "../../data/claims.js";
import { STATUS } from "ffc-ahwr-common-library";
import {
  getClaim,
  getClaims,
  updateClaimStatus,
  updateClaimData,
  getClaimHistory,
} from "../../../app/api/claims.js";
import { metricsCounter } from "../../../app/lib/metrics.js";

jest.mock("@hapi/wreck");
jest.mock("../../../app/config");
jest.mock("../../../app/lib/metrics.js");

describe("Claims API", () => {
  const applicationReference = "AHWR-1234-APP1";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getClaim", () => {
    test("getClaim", async () => {
      const wreckResponse = {
        payload: claims[0],
        res: {
          statusCode: 200,
        },
        json: true,
      };

      wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);

      const response = await getClaim("RESH-1111-1111");

      expect(wreck.get).toHaveBeenCalledWith(expect.stringMatching("/claims/RESH-1111-1111"), {
        json: true,
        headers: { "x-api-key": process.env.BACKEND_API_KEY },
      });
      expect(response).toEqual(wreckResponse.payload);
    });

    test("getClaim error", async () => {
      const wreckResponse = {
        res: {
          statusCode: 404,
        },
        json: true,
      };

      wreck.get = jest.fn().mockRejectedValueOnce(wreckResponse);

      const logger = { error: jest.fn() };
      expect(async () => {
        await getClaim("RESH-2222-2222", logger);
      }).rejects.toEqual(wreckResponse);
    });
  });

  describe("getClaims", () => {
    test("getClaims (post)", async () => {
      const wreckResponse = {
        payload: { claims, total: claims.length },
        res: {
          statusCode: 200,
        },
        json: true,
      };

      wreck.post = jest.fn().mockResolvedValueOnce(wreckResponse);

      const response = await getClaims("sbi", "12345");

      expect(response).toEqual(wreckResponse.payload);
    });

    test("getClaims (post) error", async () => {
      const wreckResponse = {
        res: {
          statusCode: 500,
        },
        json: true,
      };

      wreck.post = jest.fn().mockRejectedValueOnce(wreckResponse);

      const logger = { error: jest.fn() };
      const filter = { field: "updatedAt", op: "lte", value: "2025-01-17" };
      expect(async () => {
        await getClaims("sbi", "1010", filter, 10, 10, "ASC", logger);
      }).rejects.toEqual(wreckResponse);
    });
  });

  describe("updateClaimStatus", () => {
    test("updateClaimStatus", async () => {
      const wreckResponse = {
        payload: claims[0],
        res: {
          statusCode: 200,
        },
        json: true,
      };

      wreck.put = jest.fn().mockResolvedValueOnce(wreckResponse);

      const response = await updateClaimStatus(applicationReference, "Admin", STATUS.IN_CHECK);

      expect(response).toEqual(wreckResponse.payload);
      expect(metricsCounter).toHaveBeenCalledWith("claim_status_update");
    });

    test("updateClaimStatus error", async () => {
      const wreckResponse = {
        payload: claims[0],
        res: {
          statusCode: 400,
        },
        json: true,
      };

      wreck.put = jest.fn().mockRejectedValueOnce(wreckResponse);
      const logger = { error: jest.fn() };

      expect(async () => {
        await updateClaimStatus(applicationReference, "Admin", STATUS.IN_CHECK, logger);
      }).rejects.toEqual(wreckResponse);
      expect(metricsCounter).not.toHaveBeenCalled();
    });
  });

  describe("updateClaimData", () => {
    test("updateClaimData", async () => {
      const wreckResponse = {
        payload: {},
        res: {
          statusCode: 204,
        },
        json: true,
      };
      const logger = { error: jest.fn() };

      wreck.put = jest.fn().mockResolvedValueOnce(wreckResponse);

      const response = await updateClaimData(
        applicationReference,
        {
          vetsName: "John Doe",
          dateOfVisit: "2025-01-17",
          vetRCVSNumber: "123456",
        },
        "my note",
        "Admin",
        logger,
      );

      expect(response).toEqual(wreckResponse.payload);
      expect(metricsCounter).toHaveBeenCalledWith("claim_data_update");
    });

    test("updateClaimData error", async () => {
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
        await updateClaimData(
          applicationReference,
          {
            vetsName: "John Doe",
            dateOfVisit: "2025-01-17",
            vetRCVSNumber: "123456",
          },
          "my note",
          "Admin",
          logger,
        );
      }).rejects.toEqual(wreckResponse);
      expect(metricsCounter).not.toHaveBeenCalled();
    });
  });

  describe("getClaimHistory", () => {
    test("returns payload if all fine", async () => {
      const wreckResponse = {
        payload: claims[0],
        res: {
          statusCode: 200,
        },
        json: true,
      };

      wreck.get = jest.fn().mockResolvedValueOnce(wreckResponse);

      const response = await getClaimHistory("RESH-1111-1111");

      expect(wreck.get).toHaveBeenCalledWith(
        expect.stringMatching("/claims/RESH-1111-1111/history"),
        {
          json: true,
          headers: { "x-api-key": process.env.BACKEND_API_KEY },
        },
      );
      expect(response).toEqual(wreckResponse.payload);
    });

    test("throws error on error response", async () => {
      const wreckResponse = {
        res: {
          statusCode: 404,
        },
        json: true,
      };

      wreck.get = jest.fn().mockRejectedValueOnce(wreckResponse);

      const logger = { error: jest.fn() };
      expect(async () => {
        await getClaimHistory("RESH-2222-2222", logger);
      }).rejects.toEqual(wreckResponse);
    });
  });
});
