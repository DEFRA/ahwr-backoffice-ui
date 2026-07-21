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
import { AGREEMENT_TYPE } from "../../../../app/constants/index.js";
import { StatusCodes } from "http-status-codes";
import { SEARCH_STATUS } from "../../../../app/routes/utils/get-claim-status-options.js";

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
      expect(getClaimSearch).toHaveBeenCalledTimes(5);
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

    test("has an advanced search disclosure", async () => {
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };
      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);
      expect($(".govuk-details__summary-text").text()).toContain("Advanced search");
    });

    test("has a search button in the advanced search group", async () => {
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };
      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);
      expect($(".govuk-button-group button.govuk-button").text()).toContain("Search");
    });

    test("has an agreement type dropdown", async () => {
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };
      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);
      expect($('label[for="agreementType"]').text()).toContain("Agreement type");
      expect($("select#agreementType")).toHaveLength(1);
    });

    test("has an status dropdown", async () => {
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };
      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);
      expect($('label[for="status"]').text()).toContain("Status");
      expect($("select#status")).toHaveLength(1);
    });

    test("agreement type dropdown has All types, IAHW and PBR options in order", async () => {
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };
      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);
      const optionTexts = $("select#agreementType option")
        .map((_, el) => $(el).text().trim())
        .get();
      expect(optionTexts).toEqual(["All types", "IAHW", "PBR"]);
    });

    test("status dropdown has All types, and the status values", async () => {
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };
      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);
      const optionTexts = $("select#status option")
        .map((_, el) => $(el).text().trim())
        .get();
      expect(optionTexts).toEqual([
        "All statuses",
        "Agreed",
        "Withdrawn",
        "In check",
        "Accepted",
        "Not agreed",
        "Paid",
        "Ready to pay",
        "Rejected",
        "On hold",
        "Recommended to pay",
        "Recommended to reject",
        "Authorised",
        "Sent to finance",
        "Payment held",
      ]);
    });

    test("has a clear all filters link with href /claims/clear", async () => {
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };
      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);
      const clearLink = $(".govuk-button-group a.govuk-link");
      expect(clearLink.text()).toContain("Clear all filters");
      expect(clearLink.attr("href")).toEqual("/claims/clear");
    });

    test("advanced search rendering has no accessibility violations", async () => {
      getClaims.mockReturnValueOnce({ claims, total: 0 });
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };
      const res = await server.inject(options);
      expect(await axe(res.payload)).toHaveNoViolations();
    });

    test("clear route returns 200 and resets the advanced search session", async () => {
      const options = {
        method: "GET",
        url: `${url}/clear`,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setClaimSearch).toHaveBeenCalledWith(
        expect.anything(),
        "agreementType",
        AGREEMENT_TYPE.ALL,
      );
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "status", SEARCH_STATUS.ALL);
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "searchText", "");
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "searchType", "");
    });

    test("clear route surfaces an error when building the view fails", async () => {
      getPagination.mockImplementationOnce(() => {
        throw new Error("boom");
      });
      const options = {
        method: "GET",
        url: `${url}/clear`,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
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
      expect(setClaimSearch).toHaveBeenCalledTimes(4);
    });

    test("advanced search stores the agreement type and clears the text search", async () => {
      getClaims.mockReturnValue({ claims, total: 0 });
      const options = {
        method: "POST",
        url,
        payload: { crumb, searchText: "107279003", agreementType: "PBR", submit: "advancedSearch" },
        headers: { cookie: `crumb=${crumb}` },
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "agreementType", "PBR");
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "searchText", "");
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "searchType", "");
    });

    test("advanced search stores the status and clears the text search", async () => {
      getClaims.mockReturnValue({ claims, total: 0 });
      const options = {
        method: "POST",
        url,
        payload: { crumb, searchText: "107279003", status: "AGREED", submit: "advancedSearch" },
        headers: { cookie: `crumb=${crumb}` },
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "status", "AGREED");
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "searchText", "");
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "searchType", "");
    });

    test("basic search stores the text and type and resets the agreement type", async () => {
      getClaims.mockReturnValue({ claims, total: 0 });
      const options = {
        method: "POST",
        url,
        payload: { crumb, searchText: "107279003", agreementType: "PBR", submit: "search" },
        headers: { cookie: `crumb=${crumb}` },
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setClaimSearch).toHaveBeenCalledWith(
        expect.anything(),
        "agreementType",
        AGREEMENT_TYPE.ALL,
      );
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "searchText", "107279003");
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "searchType", "sbi");
    });

    test("basic search stores the text and type and resets the status", async () => {
      getClaims.mockReturnValue({ claims, total: 0 });
      const options = {
        method: "POST",
        url,
        payload: { crumb, searchText: "107279003", status: "AGREED", submit: "search" },
        headers: { cookie: `crumb=${crumb}` },
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "status", SEARCH_STATUS.ALL);
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "searchText", "107279003");
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "searchType", "sbi");
    });

    test("advanced search without an agreement type falls back to all types", async () => {
      getClaims.mockReturnValue({ claims, total: 0 });
      const options = {
        method: "POST",
        url,
        payload: { crumb, submit: "advancedSearch" },
        headers: { cookie: `crumb=${crumb}` },
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setClaimSearch).toHaveBeenCalledWith(
        expect.anything(),
        "agreementType",
        AGREEMENT_TYPE.ALL,
      );
    });

    test("advanced search without an status falls back to all types", async () => {
      getClaims.mockReturnValue({ claims, total: 0 });
      const options = {
        method: "POST",
        url,
        payload: { crumb, submit: "advancedSearch" },
        headers: { cookie: `crumb=${crumb}` },
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "status", SEARCH_STATUS.ALL);
    });

    test("basic search without search text falls back to an empty string", async () => {
      getClaims.mockReturnValue({ claims, total: 0 });
      const options = {
        method: "POST",
        url,
        payload: { crumb, submit: "search" },
        headers: { cookie: `crumb=${crumb}` },
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "searchText", "");
      expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "searchType", "reset");
    });

    test.each([
      { searchText: "Beef cattle", searchType: "species" },
      { searchText: "01/12/2024", searchType: "date" },
      { searchText: "on hold", searchType: "status" },
      { searchText: "Foxes Drove Farm", searchType: "organisation" },
    ])(
      "classifies an unsupported basic-search term ($searchText) and stores its type",
      async ({ searchText, searchType }) => {
        getClaims.mockReturnValue({ claims, total: 0 });
        const options = {
          method: "POST",
          url,
          payload: { crumb, searchText, submit: "search" },
          headers: { cookie: `crumb=${crumb}` },
          auth,
        };
        const res = await server.inject(options);
        expect(res.statusCode).toBe(StatusCodes.OK);
        expect(setClaimSearch).toHaveBeenCalledWith(expect.anything(), "searchType", searchType);
      },
    );
  });

  describe("Basic search term rationalisation", () => {
    // The session is mocked, so a POST's stored searchType does not round-trip to getViewData;
    // drive the stored type directly to exercise the allow-list on render.
    const searchByType = async ({ searchText = "", searchType }) => {
      getClaimSearch.mockImplementation((_request, key) => {
        if (key === "searchType") return searchType;
        if (key === "searchText") return searchText;
        return undefined;
      });
      return server.inject({ method: "GET", url: `${url}?page=1`, auth });
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("hint tells the user only claim number or SBI are searchable", async () => {
      const res = await searchByType({ searchType: "reset" });
      const $ = cheerio.load(res.payload);
      expect($("#claimSearch-hint").text().replace(/\s+/g, " ").trim()).toEqual(
        "Search by claim number or SBI.",
      );
    });

    test.each([
      { searchText: "REBC-A1B2-C3D4", searchType: "ref" },
      { searchText: "107279003", searchType: "sbi" },
    ])(
      "supported search type ($searchType) queries the backend and shows results",
      async ({ searchText, searchType }) => {
        getClaims.mockReturnValueOnce({ claims, total: 3 });
        const res = await searchByType({ searchText, searchType });
        expect(res.statusCode).toBe(StatusCodes.OK);
        expect(getClaims).toHaveBeenCalledWith(
          { searchText, searchType, agreementType: AGREEMENT_TYPE.ALL, status: SEARCH_STATUS.ALL },
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
      const res = await searchByType({ searchText: "107279003", searchType: "sbi" });
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(getClaims).toHaveBeenCalled();
      const $ = cheerio.load(res.payload);
      expect($("p.no-results-message").text()).toMatch("No claims found.");
      expect($("p.govuk-error-message")).toHaveLength(0);
      expect($("p.govuk-body.govuk-\\!-font-weight-bold").text()).toEqual("0 search results");
    });

    test.each([
      { searchType: "species" },
      { searchType: "date" },
      { searchType: "status" },
      { searchType: "organisation" },
    ])(
      "unsupported search type ($searchType) returns no claims without querying the backend",
      async ({ searchType }) => {
        const res = await searchByType({ searchType });
        expect(res.statusCode).toBe(StatusCodes.OK);
        expect(await axe(res.payload)).toHaveNoViolations();
        expect(getClaims).not.toHaveBeenCalled();
        const $ = cheerio.load(res.payload);
        expect($("p.no-results-message").text()).toMatch("No claims found.");
        expect($("p.govuk-error-message")).toHaveLength(0);
        expect($("p.govuk-body.govuk-\\!-font-weight-bold").text()).toEqual("0 search results");
      },
    );

    test("empty/absent search type shows all claims (default state)", async () => {
      getClaims.mockReturnValueOnce({ claims, total: 9 });
      const res = await searchByType({ searchText: "", searchType: "reset" });
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      expect(getClaims).toHaveBeenCalledWith(
        {
          searchText: "",
          searchType: "reset",
          agreementType: AGREEMENT_TYPE.ALL,
          status: SEARCH_STATUS.ALL,
        },
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
