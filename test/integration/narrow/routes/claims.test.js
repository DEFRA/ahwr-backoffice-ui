import { getCrumbs } from "../../../utils/get-crumbs.js";
import { permissions } from "../../../../app/auth/permissions.js";
import { getClaims } from "../../../../app/api/claims.js";
import { getPagination, getPagingData } from "../../../../app/pagination.js";
import { createServer } from "../../../../app/server.js";
import * as cheerio from "cheerio";
import { axe } from "../../../helpers/axe-helper.js";
import { phaseBannerOk } from "../../../utils/phase-banner-expect.js";
import { claims } from "../../../data/claims.js";
import { getClaimSearch, setClaimSearch } from "../../../../app/session/index.js";
import { StatusCodes } from "http-status-codes";

jest.mock("../../../../app/session");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/pagination");
jest.mock("../../../../app/routes/models/claim-list");
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

getClaims.mockReturnValue(claims);

const { administrator } = permissions;

describe("Claims tests", () => {
  const url = "/claims";
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { username: "test user" } },
  };

  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  describe(`GET ${url} route`, () => {
    test("returns 302 no auth", async () => {
      const options = {
        method: "GET",
        url,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("returns 200", async () => {
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("Claims");
      expect($("title").text()).toContain("AHWR Claims");
      expect(getClaimSearch).toHaveBeenCalledTimes(2);
      phaseBannerOk($);
    });

    test("shows total search results in bold above the table", async () => {
      getClaims.mockReturnValueOnce({ claims, total: 9 });
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      const results = $("p.govuk-body.govuk-\\!-font-weight-bold");
      expect(results.text()).toEqual("9 search results");
    });

    test("returns 200 with query parameter", async () => {
      const options = {
        method: "GET",
        url: `${url}/sort/claim number/descending`,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setClaimSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe(`POST ${url} route`, () => {
    let crumb;

    beforeEach(async () => {
      crumb = await getCrumbs(server);
      jest.clearAllMocks();
    });

    test("returns 302 no auth", async () => {
      const options = {
        method: "POST",
        url,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("returns 200", async () => {
      const options = {
        method: "POST",
        payload: { crumb, searchText: "test" },
        headers: { cookie: `crumb=${crumb}` },
        url,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setClaimSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe("Basic search term rationalisation", () => {
    const search = async (searchText) => {
      getClaimSearch.mockReturnValueOnce(searchText);
      return server.inject({ method: "GET", url: `${url}?page=1`, auth });
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("hint tells the user only claim number or SBI are searchable", async () => {
      const res = await search("");
      const $ = cheerio.load(res.payload);
      expect($("#claimSearch-hint").text().replace(/\s+/g, " ").trim()).toEqual(
        "Search by claim number or SBI.",
      );
    });

    test.each([
      { searchText: "REBC-A1B2-C3D4", type: "ref" }, // claim number
      { searchText: "107279003", type: "sbi" }, // SBI
    ])(
      "supported search ($searchText) queries the backend and shows results",
      async ({ searchText, type }) => {
        getClaims.mockReturnValueOnce({ claims, total: 3 });
        const res = await search(searchText);
        expect(res.statusCode).toBe(StatusCodes.OK);
        expect(getClaims).toHaveBeenCalledWith(
          type,
          searchText,
          undefined,
          10,
          0,
          undefined,
          expect.anything(),
        );
        const $ = cheerio.load(res.payload);
        expect($("p.govuk-body.govuk-\\!-font-weight-bold").text()).toEqual("3 search results");
        expect($("p.no-results-message")).toHaveLength(0);
      },
    );

    test("supported search with no match shows the no-results state", async () => {
      getClaims.mockReturnValueOnce({ claims: [], total: 0 });
      const res = await search("107279003");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(getClaims).toHaveBeenCalled();
      const $ = cheerio.load(res.payload);
      expect($("p.no-results-message").text()).toMatch("No claims found.");
      expect($("p.govuk-error-message")).toHaveLength(0);
      expect($("p.govuk-body.govuk-\\!-font-weight-bold").text()).toEqual("0 search results");
    });

    test.each([
      { searchText: "Beef cattle" }, // species
      { searchText: "Dairy cattle" }, // species
      { searchText: "Pigs" }, // species
      { searchText: "Sheep" }, // species
      { searchText: "Poultry" }, // species (falls through to organisation)
      { searchText: "01/12/2024" }, // claim date
      { searchText: "on hold" }, // claim status
      { searchText: "Foxes Drove Farm" }, // organisation / free text
    ])(
      "retired search ($searchText) returns no claims without querying the backend",
      async ({ searchText }) => {
        const res = await search(searchText);
        expect(res.statusCode).toBe(StatusCodes.OK);
        expect(await axe(res.payload)).toHaveNoViolations();
        expect(getClaims).not.toHaveBeenCalled();
        const $ = cheerio.load(res.payload);
        expect($("p.no-results-message").text()).toMatch("No claims found.");
        expect($("p.govuk-error-message")).toHaveLength(0);
        expect($("p.govuk-body.govuk-\\!-font-weight-bold").text()).toEqual("0 search results");
      },
    );

    test("empty search shows all claims (default state)", async () => {
      getClaims.mockReturnValueOnce({ claims, total: 9 });
      const res = await search("");
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(getClaims).toHaveBeenCalledWith(
        "reset",
        "",
        undefined,
        10,
        0,
        undefined,
        expect.anything(),
      );
      const $ = cheerio.load(res.payload);
      expect($("p.govuk-body.govuk-\\!-font-weight-bold").text()).toEqual("9 search results");
      expect($("p.no-results-message")).toHaveLength(0);
    });
  });
});
