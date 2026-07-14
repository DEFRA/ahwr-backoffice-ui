import * as cheerio from "cheerio";
import { axe } from "../../../helpers/axe-helper.js";
import { phaseBannerOk } from "../../../utils/phase-banner-expect.js";
import { permissions } from "../../../../app/auth/permissions.js";
import { getPagination, getPagingData } from "../../../../app/pagination.js";
import { getApplications } from "../../../../app/api/applications.js";
import { getAppSearch, setAppSearch } from "../../../../app/session/index.js";
import { AGREEMENT_TYPE } from "../../../../app/constants/index.js";
import { applicationsData } from "../../../data/applications.js";
import { createServer } from "../../../../app/server.js";
import { StatusCodes } from "http-status-codes";

const { administrator } = permissions;

jest.mock("../../../../app/session");
jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/pagination");
jest.mock("../../../../app/auth");

getPagination.mockReturnValue({
  limit: 10,
  offset: 0,
});

getPagingData.mockReturnValue({
  page: 1,
  totalPages: 1,
  total: 1,
  limit: 10,
});

getApplications.mockReturnValue(applicationsData);

getAppSearch
  .mockReturnValue([])
  .mockReturnValueOnce(["PENDING", "APPLIED", "CLAIMED"])
  .mockReturnValueOnce({ field: "SBI", direction: "DESC" });

describe("Applications Filter test", () => {
  const url = "/agreements/remove";
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { username: "test user" } },
  };
  const method = "GET";

  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(`GET ${url} route remove`, () => {
    test("returns 302 no auth", async () => {
      const options = {
        method,
        url: `${url}/PENDING`,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });
    test("returns 200", async () => {
      const options = {
        method,
        url: `${url}/PENDING`,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("Agreements");
      expect($("title").text()).toContain("AHWR Agreements");
      phaseBannerOk($);
    });
  });

  describe("GET /agreements/clear route", () => {
    test("returns 302 no auth", async () => {
      const options = {
        method,
        url: "/agreements/clear",
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });
    test("returns 200", async () => {
      const options = {
        method,
        url: "/agreements/clear",
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("Agreements");
      expect($("title").text()).toContain("AHWR Agreements");
      expect(setAppSearch).toHaveBeenCalledWith(expect.anything(), "searchText", "");
      expect(setAppSearch).toHaveBeenCalledWith(expect.anything(), "searchType", "");
      expect(setAppSearch).toHaveBeenCalledWith(expect.anything(), "status", []);
      expect(setAppSearch).toHaveBeenCalledWith(
        expect.anything(),
        "agreementType",
        AGREEMENT_TYPE.ALL,
      );
      phaseBannerOk($);
    });
  });

  describe("GET /agreements/sort route", () => {
    test("returns 302 no auth", async () => {
      const options = {
        method,
        url: "/agreements/sort/sbi/ascending",
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("returns 200 ascending", async () => {
      const options = {
        method,
        url: "/agreements/sort/sbi/ascending",
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.payload).toEqual("1");
      expect(setAppSearch).toHaveBeenCalledWith(
        expect.anything(),
        "sort",
        expect.objectContaining({ field: "sbi", direction: "DESC" }),
      );
    });

    test("returns 200 descending", async () => {
      const options = {
        method,
        url: "/agreements/sort/sbi/descending",
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.payload).toEqual("1");
      expect(setAppSearch).toHaveBeenCalledWith(
        expect.anything(),
        "sort",
        expect.objectContaining({ field: "sbi", direction: "ASC" }),
      );
    });
  });
});
