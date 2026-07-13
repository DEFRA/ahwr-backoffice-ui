import * as cheerio from "cheerio";
import { axe } from "../../../helpers/axe-helper.js";
import { phaseBannerOk } from "../../../utils/phase-banner-expect.js";
import { getCrumbs } from "../../../utils/get-crumbs.js";
import { permissions } from "../../../../app/auth/permissions.js";
import { getAppSearch, setAppSearch } from "../../../../app/session/index.js";
import { getPagination, getPagingData } from "../../../../app/pagination.js";
import { getApplications } from "../../../../app/api/applications.js";
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
      expect(getAppSearch).toHaveBeenCalledTimes(5);
      phaseBannerOk($);
    });

    test("returns 200 with query parameter", async () => {
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("Agreements");
      expect($("title").text()).toContain("AHWR Agreements");
      expect($("span.govuk-tag--green").text()).toContain("Agreed");
      expect($("span.govuk-tag--orange").text()).toContain("Check");
      expect($("span.govuk-tag--blue").text()).toContain("Paid");
      expect($("span.govuk-tag--purple").text()).toContain("Accepted");
      expect($("span.govuk-tag--blue").text()).toContain("Claimed");
      expect($("span.govuk-tag--grey").text()).toContain("Withdrawn");
      expect($("span.govuk-tag--red").text()).toContain("Rejected");
      expect($('th[aria-sort="none"]').text()).toContain("SBI");
      expect($('th[aria-sort="none"]').text()).toContain("Status");
      expect(getAppSearch).toHaveBeenCalled();
      expect(getApplications).toHaveBeenCalled();
      expect(getPagination).toHaveBeenCalled();
      expect(getPagination).toHaveBeenCalledWith(1);
      expect(getPagingData).toHaveBeenCalled();
      expect(getPagingData).toHaveBeenCalledWith(9, 10, {
        limit: 20,
        page: 1,
      });
      phaseBannerOk($);
    });

    test("should head column agreement date", async () => {
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      const $ = cheerio.load(res.payload);
      expect($('th[aria-sort="none"]').text()).toContain("Agreement date");
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

    test("returns 200 without query parameter", async () => {
      const options = {
        method: "GET",
        url: `${url}`,
        auth,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toEqual("Agreements");
      expect($("title").text()).toContain("AHWR Agreements");
      expect($("span.govuk-tag--green").text()).toContain("Agreed");
      expect($("span.govuk-tag--orange").text()).toContain("Check");
      expect($("span.govuk-tag--blue").text()).toContain("Paid");
      expect($("span.govuk-tag--purple").text()).toContain("Accepted");
      expect($("span.govuk-tag--blue").text()).toContain("Claimed");
      expect($("span.govuk-tag--grey").text()).toContain("Withdrawn");
      expect($("span.govuk-tag--red").text()).toContain("Rejected");
      expect(getAppSearch).toHaveBeenCalled();
      expect(getApplications).toHaveBeenCalled();
      expect(getPagination).toHaveBeenCalled();
      expect(getPagingData).toHaveBeenCalled();
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
  });
});
