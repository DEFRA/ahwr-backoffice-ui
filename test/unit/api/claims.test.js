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
import { config } from "../../../app/config/index.js";
import { AGREEMENT_TYPE } from "../../../app/constants/index.js";

jest.mock("@hapi/wreck");
jest.mock("../../../app/config");
jest.mock("../../../app/lib/metrics.js");

const { apiKeys, applicationApiUri } = config;

describe("Claims API", () => {
  const applicationReference = "AHWR-1234-APP1";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET getClaim", () => {
    test("returns payload if everything ok", async () => {
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
        headers: { "x-api-key": apiKeys.backofficeUiApiKey },
      });
      expect(response).toEqual(wreckResponse.payload);
    });

    test("throws error if error returned", async () => {
      const wreckResponse = {
        res: {
          statusCode: 404,
        },
        json: true,
      };

      wreck.get = jest.fn().mockRejectedValueOnce(wreckResponse);

      const logger = { error: jest.fn() };
      await expect(async () => {
        await getClaim("RESH-2222-2222", logger);
      }).rejects.toEqual(wreckResponse);
    });
  });

  describe("POST getClaims", () => {
    const limit = 20;
    const offset = 0;
    const searchText = "12345";
    const searchType = "sbi";
    const endpoint = `${applicationApiUri}/claims/search`;

    test("returns the payload and posts the base search payload", async () => {
      const wreckResponse = {
        payload: { claims, total: claims.length },
        res: {
          statusCode: 200,
        },
        json: true,
      };

      wreck.post = jest.fn().mockResolvedValueOnce(wreckResponse);

      const response = await getClaims({ searchType, searchText }, limit, offset);

      expect(response).toEqual(wreckResponse.payload);
      expect(wreck.post).toHaveBeenCalledWith(endpoint, {
        payload: {
          search: { text: searchText, type: searchType },
          filter: undefined,
          limit,
          offset,
          sort: undefined,
        },
        json: true,
        headers: { "x-api-key": apiKeys.backofficeUiApiKey },
      });
    });

    test("includes agreementType in the payload when a specific type is given", async () => {
      const sort = "ASC";
      wreck.post = jest.fn().mockResolvedValueOnce({ payload: { claims: [], total: 0 } });

      await getClaims({ searchType, searchText, agreementType: "PBR" }, limit, offset, sort);

      expect(wreck.post).toHaveBeenCalledWith(endpoint, {
        payload: {
          search: { text: searchText, type: searchType },
          filter: undefined,
          limit,
          offset,
          agreementType: "PBR",
          sort,
        },
        json: true,
        headers: { "x-api-key": apiKeys.backofficeUiApiKey },
      });
    });

    test("omits agreementType from the payload when the type is all", async () => {
      const sort = "ASC";
      wreck.post = jest.fn().mockResolvedValueOnce({ payload: { claims: [], total: 0 } });

      await getClaims(
        { searchType, searchText, agreementType: AGREEMENT_TYPE.ALL },
        limit,
        offset,
        sort,
      );

      expect(wreck.post).toHaveBeenCalledWith(endpoint, {
        payload: {
          search: { text: searchText, type: searchType },
          filter: undefined,
          limit,
          offset,
          sort,
        },
        json: true,
        headers: { "x-api-key": apiKeys.backofficeUiApiKey },
      });
    });

    test("throws error if error returned", async () => {
      const wreckResponse = {
        res: {
          statusCode: 500,
        },
        json: true,
      };

      wreck.post = jest.fn().mockRejectedValueOnce(wreckResponse);

      const logger = { error: jest.fn() };
      const filter = { field: "updatedAt", op: "lte", value: "2025-01-17" };
      await expect(async () => {
        await getClaims({ searchType: "sbi", searchText: "1010", filter }, 10, 10, "ASC", logger);
      }).rejects.toEqual(wreckResponse);
    });
  });

  describe("PUT updateClaimStatus", () => {
    test("returns payload if all ok", async () => {
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

    test("throws error if error returned", async () => {
      const wreckResponse = {
        payload: claims[0],
        res: {
          statusCode: 400,
        },
        json: true,
      };

      wreck.put = jest.fn().mockRejectedValueOnce(wreckResponse);
      const logger = { error: jest.fn() };

      await expect(async () => {
        await updateClaimStatus(applicationReference, "Admin", STATUS.IN_CHECK, logger);
      }).rejects.toEqual(wreckResponse);
      expect(metricsCounter).not.toHaveBeenCalled();
    });
  });

  describe("PUT updateClaimData", () => {
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

      await expect(async () => {
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

  describe("GET getClaimHistory", () => {
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
          headers: { "x-api-key": apiKeys.backofficeUiApiKey },
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
      await expect(async () => {
        await getClaimHistory("RESH-2222-2222", logger);
      }).rejects.toEqual(wreckResponse);
    });
  });
});
