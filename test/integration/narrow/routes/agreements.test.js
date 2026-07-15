import * as cheerio from "cheerio";
import { axe } from "../../../helpers/axe-helper.js";
import { phaseBannerOk } from "../../../utils/phase-banner-expect.js";
import { getCrumbs } from "../../../utils/get-crumbs.js";
import { permissions } from "../../../../app/auth/permissions.js";
import { getAppSearch, setAppSearch } from "../../../../app/session/index.js";
import { getPagination, getPagingData } from "../../../../app/pagination.js";
import { getApplications } from "../../../../app/api/applications.js";
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

// The application data contains multiple agreements with each one
// having a different status.
getApplications.mockReturnValue(applicationsData);

describe("Applications test", () => {
  const url = "/agreements";
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { username: "test user" } },
  };

  let server;

  beforeAll(async () => {
    jest.clearAllMocks();
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
        url,
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

    describe.each([
      { parameters: "with", urlOption: "?page=1" },
      { parameters: "without", urlOption: "" },
    ])("$parameters query parameter", ({ urlOption }) => {
      const options = {
        method: "GET",
        url: `${url}${urlOption}`,
        auth,
      };

      test("returns 200", async () => {
        const res = await server.inject(options);
        expect(res.statusCode).toBe(StatusCodes.OK);
        expect(await axe(res.payload)).toHaveNoViolations();
      });

      test("has no accessibility violations", async () => {
        const res = await server.inject(options);
        expect(await axe(res.payload)).toHaveNoViolations();
      });

      test("has phase banner", async () => {
        const res = await server.inject(options);
        const $ = cheerio.load(res.payload);
        phaseBannerOk($);
      });

      test.each([
        {
          title: "has the full browser title",
          selector: "title",
          text: "Administration: AHWR Agreements",
        },
        { title: "shows the agreed status", selector: "span.govuk-tag--green", text: "Agreed" },
        { title: "has the check status", selector: "span.govuk-tag--orange", text: "Check" },
        { title: "has the paid status", selector: "span.govuk-tag--blue", text: "Paid" },
        { title: "has the accepted status", selector: "span.govuk-tag--purple", text: "Accepted" },
        { title: "has the claimed status", selector: "span.govuk-tag--blue", text: "Claimed" },
        { title: "has the withdraw status", selector: "span.govuk-tag--grey", text: "Withdrawn" },
        { title: "has the rejected status", selector: "span.govuk-tag--red", text: "Rejected" },
        { title: "has the sbi header", selector: 'th[aria-sort="none"]', text: "SBI number" },
        { title: "has the status header", selector: 'th[aria-sort="none"]', text: "Status" },
        {
          title: "has the agreement date header",
          selector: 'th[aria-sort="none"]',
          text: "Agreement date",
        },
        {
          title: "has the agreement number header",
          selector: 'th[aria-sort="none"]',
          text: "Agreement number",
        },
        {
          title: "has the organisation header",
          selector: 'th[aria-sort="none"]',
          text: "Organisation",
        },
        {
          title: "has advanced search option",
          selector: ".govuk-details__summary-text",
          text: "Advanced search",
        },
        {
          title: "has a search button in the advanced search",
          selector: ".govuk-button-group button.govuk-button",
          text: "Search",
        },
      ])("$title", async ({ selector, text }) => {
        const res = await server.inject(options);
        const $ = cheerio.load(res.payload);
        expect($(selector).text()).toContain(text);
      });

      test("has the full page heading", async () => {
        const res = await server.inject(options);
        const $ = cheerio.load(res.payload);
        expect($("h1.govuk-heading-xl").text()).toEqual("Claims, Agreements and Flags");
      });

      test("has the tab heading", async () => {
        const res = await server.inject(options);
        const $ = cheerio.load(res.payload);
        expect($("h1.govuk-heading-l").text()).toEqual("Agreements");
      });

      test("has an agreement type dropdown", async () => {
        const res = await server.inject(options);
        const $ = cheerio.load(res.payload);
        expect($('label[for="agreementType"]').text()).toContain("Agreement type");
        expect($("select#agreementType")).toHaveLength(1);
      });

      test("agreement type dropdown has All types, IAHW and PBR options", async () => {
        const res = await server.inject(options);
        const $ = cheerio.load(res.payload);
        const optionTexts = $("select#agreementType option")
          .map((_, el) => $(el).text().trim())
          .get();
        expect(optionTexts).toEqual(["All types", "IAHW", "PBR"]);
      });

      test("has a clear all filters link", async () => {
        const res = await server.inject(options);
        const $ = cheerio.load(res.payload);
        const clearLink = $(".govuk-button-group a.govuk-link");
        expect(clearLink.text()).toContain("Clear all filters");
        expect(clearLink.attr("href")).toEqual("/agreements/clear");
      });

      test("has agreement date from and to inputs with day, month and year boxes", async () => {
        const res = await server.inject(options);
        const $ = cheerio.load(res.payload);
        const legends = $(".govuk-fieldset__legend")
          .map((_, el) => $(el).text().trim())
          .get();
        expect(legends).toEqual(
          expect.arrayContaining(["Agreement date from", "Agreement date to"]),
        );
        for (const name of [
          "dateFrom-day",
          "dateFrom-month",
          "dateFrom-year",
          "dateTo-day",
          "dateTo-month",
          "dateTo-year",
        ]) {
          expect($(`input[name='${name}']`)).toHaveLength(1);
        }
      });
    });

    test("should sort in descending order when requested", async () => {
      let options = {
        method: "GET",
        url: "/agreements/sort/SBI/descending",
        auth,
      };
      let res = await server.inject(options);
      options = {
        method: "GET",
        url: `${url}?page=2`,
        auth,
      };
      res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      const $ = cheerio.load(res.payload);
      expect($('th[aria-sort="none"]').text()).toContain("SBI");
      expect(getAppSearch).toHaveBeenCalled();
      expect(getApplications).toHaveBeenCalled();
      expect(getPagination).toHaveBeenCalled();
      expect(getPagination).toHaveBeenCalledWith(2);
      expect(getPagingData).toHaveBeenCalled();
      expect(getPagingData).toHaveBeenCalledWith(9, 10, {
        limit: 20,
        page: 1,
      });
      phaseBannerOk($);
    });

    test("shows total search results in bold above the table", async () => {
      const options = {
        method: "GET",
        url,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      const results = $("p.govuk-body.govuk-\\!-font-weight-bold");
      expect(results.text()).toEqual("9 search results");
    });

    test("returns 200 clear", async () => {
      const options = {
        method: "GET",
        url: `${url}/clear`,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
    });

    test("returns 200 remove status", async () => {
      getAppSearch.mockReturnValueOnce(["AGREED"]);
      const options = {
        method: "GET",
        url: `${url}/remove/AGREED`,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
    });
  });

  describe(`POST ${url} route`, () => {
    let crumb;
    const method = "POST";

    beforeEach(async () => {
      crumb = await getCrumbs(server);
    });

    test("returns 302 no auth", async () => {
      const options = {
        method,
        url,
        payload: {
          crumb,
          searchText: "333333333",
          searchType: "sbi",
          submit: "search",
        },
        headers: { cookie: `crumb=${crumb}` },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test.each([
      { searchText: "AHWR-555A-FD6E" }, // agreement number
      { searchText: "107279003" }, // sbi
      { searchText: "Foxes Drove Farm" }, // organisation
    ])("supported search ($searchText) posts and queries the backend", async ({ searchText }) => {
      const options = {
        method,
        url,
        payload: {
          crumb,
          searchText,
          status: [],
          submit: "search",
        },
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };
      getApplications.mockReturnValue({
        applications: [],
        applicationStatus: [],
        total: 0,
      });
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(getAppSearch).toHaveBeenCalled();
      expect(setAppSearch).toHaveBeenCalled();
      expect(getApplications).toHaveBeenCalled();
      expect(getPagination).toHaveBeenCalled();
    });

    test.each([
      { searchDetails: { searchText: "333333333" } },
      { searchDetails: { searchText: "444444443" } },
      { searchDetails: { searchText: "AHWR-555A-F5D5" } },
      { searchDetails: { searchText: "", submit: false } },
      { searchDetails: { searchText: "" } },
      { searchDetails: { searchText: null } },
      { searchDetails: { searchText: undefined } },
    ])("returns success with error message when no data found", async ({ searchDetails }) => {
      const options = {
        method,
        url,
        payload: {
          crumb,
          searchText: searchDetails.searchText,
          status: [],
          submit: searchDetails.submit ?? "search",
        },
        headers: { cookie: `crumb=${crumb}` },
        auth,
      };

      getApplications.mockReturnValue({
        applications: [],
        applicationStatus: [],
        total: 0,
      });
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      expect(getAppSearch).toHaveBeenCalled();
      expect(setAppSearch).toHaveBeenCalled();
      expect(getApplications).toHaveBeenCalled();
      expect(getPagination).toHaveBeenCalled();
      const $ = cheerio.load(res.payload);
      expect($("p.no-results-message").text()).toMatch("No agreements found.");
      expect($("p.govuk-error-message")).toHaveLength(0);
      expect($("p.govuk-body.govuk-\\!-font-weight-bold").text()).toEqual("0 search results");
    });

    test("advanced search stores the agreement type and does not send the text search", async () => {
      const options = {
        method,
        url,
        payload: {
          crumb,
          searchText: "107279003",
          agreementType: "IAHW",
          submit: "advancedSearch",
        },
        headers: { cookie: `crumb=${crumb}` },
        auth,
      };
      getApplications.mockReturnValue({ applications: [], total: 0 });

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setAppSearch).toHaveBeenCalledWith(expect.anything(), "agreementType", "IAHW");
      expect(setAppSearch).toHaveBeenCalledWith(expect.anything(), "searchText", "");
      expect(setAppSearch).toHaveBeenCalledWith(expect.anything(), "searchType", "");
    });

    test("advanced search stores the agreement date range parts", async () => {
      const options = {
        method,
        url,
        payload: {
          crumb,
          searchText: "",
          agreementType: "ALL",
          "dateFrom-day": "1",
          "dateFrom-month": "2",
          "dateFrom-year": "2026",
          "dateTo-day": "15",
          "dateTo-month": "7",
          "dateTo-year": "2026",
          submit: "advancedSearch",
        },
        headers: { cookie: `crumb=${crumb}` },
        auth,
      };
      getApplications.mockReturnValue({ applications: [], total: 0 });

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setAppSearch).toHaveBeenCalledWith(expect.anything(), "dateFrom", {
        day: "1",
        month: "2",
        year: "2026",
      });
      expect(setAppSearch).toHaveBeenCalledWith(expect.anything(), "dateTo", {
        day: "15",
        month: "7",
        year: "2026",
      });
    });

    test("basic search resets the agreement date range", async () => {
      const options = {
        method,
        url,
        payload: {
          crumb,
          searchText: "107279003",
          "dateFrom-day": "1",
          "dateFrom-month": "2",
          "dateFrom-year": "2026",
          submit: "search",
        },
        headers: { cookie: `crumb=${crumb}` },
        auth,
      };
      getApplications.mockReturnValue({ applications: [], total: 0 });

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setAppSearch).toHaveBeenCalledWith(expect.anything(), "dateFrom", {
        day: "",
        month: "",
        year: "",
      });
      expect(setAppSearch).toHaveBeenCalledWith(expect.anything(), "dateTo", {
        day: "",
        month: "",
        year: "",
      });
    });

    test("basic search sends the text search and resets the agreement type", async () => {
      const options = {
        method,
        url,
        payload: {
          crumb,
          searchText: "107279003",
          agreementType: "IAHW",
          submit: "search",
        },
        headers: { cookie: `crumb=${crumb}` },
        auth,
      };
      getApplications.mockReturnValue({ applications: [], total: 0 });

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(setAppSearch).toHaveBeenCalledWith(
        expect.anything(),
        "agreementType",
        AGREEMENT_TYPE.ALL,
      );
      expect(setAppSearch).toHaveBeenCalledWith(expect.anything(), "searchText", "107279003");
      expect(setAppSearch).toHaveBeenCalledWith(expect.anything(), "searchType", "sbi");
    });
  });
});
