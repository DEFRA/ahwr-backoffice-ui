import * as cheerio from "cheerio";
import { axe } from "../../../helpers/axe-helper.js";
import { phaseBannerOk } from "../../../utils/phase-banner-expect";
import { permissions } from "../../../../app/auth/permissions";
import { applicationsData } from "../../../data/applications.js";
import { getApplication } from "../../../../app/api/applications";
import { getClaims } from "../../../../app/api/claims";
import { claims } from "../../../data/claims";
import { displayContactHistory, getContactHistory } from "../../../../app/api/contact-history";
import { contactHistory } from "../../../data/contact-history";
import { getPagination, getPagingData } from "../../../../app/pagination";
import { getClaimSearch } from "../../../../app/session";
import { createServer } from "../../../../app/server";
import { StatusCodes } from "http-status-codes";
import { getClaimViewStates } from "../../../../app/routes/utils/get-claim-view-states";

const { administrator } = permissions;

jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/api/contact-history.js");
jest.mock("../../../../app/pagination");
jest.mock("../../../../app/api/claims.js");
jest.mock("../../../../app/api/contact-history.js");
jest.mock("../../../../app/auth");
jest.mock("../../../../app/session");
jest.mock("../../../../app/routes/utils/get-claim-view-states");

getApplication.mockReturnValue(applicationsData.applications[0]);
getContactHistory.mockReturnValue(contactHistory);
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
getClaims.mockReturnValue({ total: 9, claims });
displayContactHistory.mockReturnValue({
  orgEmail: "Na",
  email: "test12@testvest.com",
  farmerName: "NA",
  address: "NA",
});
getClaimViewStates.mockReturnValue({
  updateEligiblePiiRedactionAction: true,
  updateEligiblePiiRedactionForm: false,
});

const auth = {
  strategy: "session-auth",
  credentials: { scope: [administrator], account: "test user" },
};

describe("Claims test", () => {
  const url = "/agreement/123/claims";

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

    test("returns 400 if application is undefined", async () => {
      getApplication.mockReturnValueOnce(undefined);
      const options = {
        method: "GET",
        url,
        auth,
      };

      const res = await server.inject(options);
      expect(res.statusCode).toBe(400);
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
      expect($("title").text()).toContain("Administration - My Farm");
      phaseBannerOk($);

      expect($("th[aria-sort]")[0].attribs["aria-sort"]).toEqual("none");
      expect($("th[aria-sort]")[0].attribs["data-url"]).toContain("claim number");
      expect($("th[aria-sort]")[1].attribs["aria-sort"]).toEqual("none");
      expect($("th[aria-sort]")[1].attribs["data-url"]).toContain("claims/sort/species");
      expect($("th[aria-sort]")[2].attribs["aria-sort"]).toEqual("none");
      expect($("th[aria-sort]")[2].attribs["data-url"]).toContain("claims/sort/claim date");
      expect($("th[aria-sort]")[3].attribs["aria-sort"]).toEqual("none");
      expect($("th[aria-sort]")[3].attribs["data-url"]).toContain("claims/sort/status");

      const actions = $(".govuk-summary-list__actions");
      expect(actions.find("a.govuk-link").length).toBe(1);
      expect(actions.find("a.govuk-link").text()).toBe("Change");
      expect(actions.find("a.govuk-link").attr("href")).toContain(
        "/agreement/123/claims?page=1&updateEligiblePiiRedaction=true",
      );

      const redactionRow = $(".govuk-summary-list__row")
        .filter(
          (i, el) => $(el).find("dt").text().trim() === "Eligible for automated data redaction",
        )
        .first();
      expect(redactionRow.find(".govuk-summary-list__value p").text().trim()).toBe("No");
    });

    test("returns 200 and hides actions when agreement is redacted", async () => {
      getApplication.mockReturnValue({
        ...applicationsData.applications[0],
        redacted: true,
      });
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };

      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      const $ = cheerio.load(res.payload);

      const actions = $(".govuk-summary-list__actions");
      expect(actions.find("a.govuk-link").length).toBe(0);
    });

    test("returns 200 and hides actions when user not super admin", async () => {
      getClaimViewStates.mockReturnValue({
        updateEligiblePiiRedactionAction: false, // driven by isSuperAdmin
        updateEligiblePiiRedactionForm: false,
      });
      getApplication.mockReturnValue({
        ...applicationsData.applications[0],
        redacted: false,
      });

      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };

      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      const $ = cheerio.load(res.payload);

      const actions = $(".govuk-summary-list__actions");
      expect(actions.find("a.govuk-link").length).toBe(0);
    });

    test("displays eligible for automated data redaction as Yes when the value is true", async () => {
      getApplication.mockReturnValue({
        ...applicationsData.applications[0],
        eligiblePiiRedaction: true,
      });
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      const $ = cheerio.load(res.payload);
      const redactionRow = $(".govuk-summary-list__row")
        .filter(
          (i, el) => $(el).find("dt").text().trim() === "Eligible for automated data redaction",
        )
        .first();
      expect(redactionRow.find(".govuk-summary-list__value p").text().trim()).toBe("Yes");
    });

    test("returns table in correct sort order", async () => {
      getClaimSearch.mockReturnValueOnce({
        field: "claim number",
        direction: "ASC",
      });

      const options = {
        method: "GET",
        url,
        auth,
      };

      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      const $ = cheerio.load(res.payload);
      expect($("title").text()).toContain("Administration - My Farm");
      phaseBannerOk($);

      expect($("th[aria-sort]")[0].attribs["aria-sort"]).toEqual("ascending");
      expect($("th[aria-sort]")[0].attribs["data-url"]).toContain("claim number");
      expect($("th[aria-sort]")[1].attribs["aria-sort"]).toEqual("none");
      expect($("th[aria-sort]")[1].attribs["data-url"]).toContain("claims/sort/species");
      expect($("th[aria-sort]")[2].attribs["aria-sort"]).toEqual("none");
      expect($("th[aria-sort]")[2].attribs["data-url"]).toContain("claims/sort/claim date");
      expect($("th[aria-sort]")[3].attribs["aria-sort"]).toEqual("none");
      expect($("th[aria-sort]")[3].attribs["data-url"]).toContain("claims/sort/status");
    });

    test.each([
      { field: "claim number", direction: "ASC" },
      { field: "type of visit", direction: "ASC" },
      { field: "species", direction: "ASC" },
      { field: "claim date", direction: "ASC" },
      { field: "status", direction: "ASC" },
      { field: "claim number", direction: "DESC" },
      { field: "type of visit", direction: "DESC" },
      { field: "species", direction: "DESC" },
      { field: "claim date", direction: "DESC" },
      { field: "status", direction: "DESC" },
    ])(
      "returns table in correct $direction sort order on field $field",
      async ({ field, direction }) => {
        getClaimSearch.mockReturnValueOnce({ field, direction });

        const options = {
          method: "GET",
          url,
          auth,
        };

        const res = await server.inject(options);
        expect(res.statusCode).toBe(StatusCodes.OK);
        expect(await axe(res.payload)).toHaveNoViolations();
        const $ = cheerio.load(res.payload);
        expect($("title").text()).toContain("Administration - My Farm");
        phaseBannerOk($);
      },
    );

    test("returns 200 sort endpoint", async () => {
      const options = {
        method: "GET",
        url: "/agreement/123/claims/sort/claim number/DESC",
        auth,
      };

      const res = await server.inject(options);
      expect(res.result).toEqual(1);
    });

    test("the back link should go to view claim if the user is coming from view claim page", async () => {
      const options = {
        method: "GET",
        url: `${url}?page=1&returnPage=view-claim&reference=REDC-6179-D9D3`,
        auth,
      };

      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      const $ = cheerio.load(res.payload);
      expect($("title").text()).toContain("Administration - My Farm");
      phaseBannerOk($);

      expect($(".govuk-back-link").attr("href")).toEqual("/view-claim/REDC-6179-D9D3?page=1");
    });

    test("the back link should go to all agreements if the user is coming from all agreements main tab", async () => {
      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      const $ = cheerio.load(res.payload);
      expect($("title").text()).toContain("Administration - My Farm");
      phaseBannerOk($);

      expect($(".govuk-back-link").attr("href")).toEqual("/agreements?page=1");
    });
  });

  describe("herd breakdown display", () => {
    const baseClaim = claims[0];

    test("displays herd breakdown section with correct counts when claims have herds", async () => {
      const claimsWithHerds = [
        {
          ...baseClaim,
          data: { ...baseClaim.data, typeOfLivestock: "beef" },
          herd: { id: "herd-beef-1" },
        },
        {
          ...baseClaim,
          data: { ...baseClaim.data, typeOfLivestock: "beef" },
          herd: { id: "herd-beef-2" },
        },
        {
          ...baseClaim,
          data: { ...baseClaim.data, typeOfLivestock: "dairy" },
          herd: { id: "herd-dairy-1" },
        },
        {
          ...baseClaim,
          data: { ...baseClaim.data, typeOfLivestock: "sheep" },
          herd: { id: "herd-sheep-1" },
        },
        {
          ...baseClaim,
          data: { ...baseClaim.data, typeOfLivestock: "pigs" },
          herd: { id: "herd-pigs-1" },
        },
        {
          ...baseClaim,
          data: { ...baseClaim.data, typeOfLivestock: "pigs" },
          herd: { id: "herd-pigs-2" },
        },
        {
          ...baseClaim,
          data: { ...baseClaim.data, typeOfLivestock: "pigs" },
          herd: { id: "herd-pigs-3" },
        },
      ];

      getClaims.mockReturnValueOnce({ total: claimsWithHerds.length, claims: claimsWithHerds });

      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      // Check for "Number of herds and flocks" label
      expect($(".govuk-summary-list__key").text()).toContain("Number of herds and flocks");

      // Check for species labels and their counts
      expect($(".govuk-summary-list__key").text()).toContain("Beef cattle");
      expect($(".govuk-summary-list__key").text()).toContain("Dairy cattle");
      expect($(".govuk-summary-list__key").text()).toContain("Sheep");
      expect($(".govuk-summary-list__key").text()).toContain("Pigs");

      // Get the nested summary list that contains herd breakdown
      const herdBreakdownRows = $(
        ".govuk-summary-list .govuk-summary-list .govuk-summary-list__row",
      );

      // Extract the values for each species
      const beefRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Beef cattle"),
      );
      const dairyRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Dairy cattle"),
      );
      const sheepRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Sheep"),
      );
      const pigsRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Pigs"),
      );

      expect(beefRow.find(".govuk-summary-list__value").text().trim()).toBe("2");
      expect(dairyRow.find(".govuk-summary-list__value").text().trim()).toBe("1");
      expect(sheepRow.find(".govuk-summary-list__value").text().trim()).toBe("1");
      expect(pigsRow.find(".govuk-summary-list__value").text().trim()).toBe("3");
    });

    test("displays herd breakdown with zero counts when no claims have herds of that species", async () => {
      const claimsWithSingleHerd = [
        {
          ...baseClaim,
          data: { ...baseClaim.data, typeOfLivestock: "pigs" },
          herd: { id: "herd-pigs-1" },
        },
      ];

      getClaims.mockReturnValueOnce({
        total: claimsWithSingleHerd.length,
        claims: claimsWithSingleHerd,
      });

      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const herdBreakdownRows = $(
        ".govuk-summary-list .govuk-summary-list .govuk-summary-list__row",
      );

      const beefRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Beef cattle"),
      );
      const dairyRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Dairy cattle"),
      );
      const sheepRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Sheep"),
      );
      const pigsRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Pigs"),
      );

      expect(beefRow.find(".govuk-summary-list__value").text().trim()).toBe("0");
      expect(dairyRow.find(".govuk-summary-list__value").text().trim()).toBe("0");
      expect(sheepRow.find(".govuk-summary-list__value").text().trim()).toBe("0");
      expect(pigsRow.find(".govuk-summary-list__value").text().trim()).toBe("1");
    });

    test("counts claims without herd id once per species", async () => {
      const claimsWithoutHerds = [
        {
          ...baseClaim,
          data: { ...baseClaim.data, typeOfLivestock: "beef" },
        },
        {
          ...baseClaim,
          data: { ...baseClaim.data, typeOfLivestock: "beef" },
        },
        {
          ...baseClaim,
          data: { ...baseClaim.data, typeOfLivestock: "dairy" },
        },
      ];

      getClaims.mockReturnValueOnce({
        total: claimsWithoutHerds.length,
        claims: claimsWithoutHerds,
      });

      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const herdBreakdownRows = $(
        ".govuk-summary-list .govuk-summary-list .govuk-summary-list__row",
      );

      const beefRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Beef cattle"),
      );
      const dairyRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Dairy cattle"),
      );

      // Multiple beef claims without herd id should only count as 1
      expect(beefRow.find(".govuk-summary-list__value").text().trim()).toBe("1");
      expect(dairyRow.find(".govuk-summary-list__value").text().trim()).toBe("1");
    });

    test("does not double count the same herd id", async () => {
      const claimsWithDuplicateHerds = [
        {
          ...baseClaim,
          data: { ...baseClaim.data, typeOfLivestock: "sheep" },
          herd: { id: "herd-sheep-same" },
        },
        {
          ...baseClaim,
          data: { ...baseClaim.data, typeOfLivestock: "sheep" },
          herd: { id: "herd-sheep-same" },
        },
        {
          ...baseClaim,
          data: { ...baseClaim.data, typeOfLivestock: "sheep" },
          herd: { id: "herd-sheep-same" },
        },
      ];

      getClaims.mockReturnValueOnce({
        total: claimsWithDuplicateHerds.length,
        claims: claimsWithDuplicateHerds,
      });

      const options = {
        method: "GET",
        url: `${url}?page=1`,
        auth,
      };

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const herdBreakdownRows = $(
        ".govuk-summary-list .govuk-summary-list .govuk-summary-list__row",
      );

      const sheepRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Sheep"),
      );

      // Same herd id used 3 times should only count as 1
      expect(sheepRow.find(".govuk-summary-list__value").text().trim()).toBe("1");
    });
  });

  describe("poultry site breakdown display", () => {
    const poultryUrl = "/agreement/POUL-1234-APP1/claims";

    const poultryApplication = {
      ...applicationsData.applications[0],
      reference: "POUL-1234-APP1",
      organisation: {
        ...applicationsData.applications[0].organisation,
        farmerName: "Test Farmer",
        orgEmail: "org@test.com",
      },
    };

    const poultryClaim = {
      id: "58b297c9-c983-475c-8bdb-db5746899cec",
      reference: "PORE-1111-6666",
      applicationReference: "POUL-1234-APP1",
      data: {
        typesOfPoultry: ["ducks", "geese"],
        dateOfVisit: "2024-03-22T00:00:00.000Z",
      },
      herd: {
        id: "site-1-id",
      },
      type: "REVIEW",
      createdAt: "2024-03-25T12:20:18.307Z",
      status: "IN_CHECK",
      application: {
        flags: [],
      },
    };

    test("displays Number of sites for poultry applications", async () => {
      const poultryClaimsWithSites = [
        { ...poultryClaim, herd: { id: "site-1-id" } },
        { ...poultryClaim, herd: { id: "site-2-id" } },
        { ...poultryClaim, herd: { id: "site-3-id" } },
      ];

      getApplication.mockReturnValueOnce(poultryApplication);
      getClaims.mockReturnValueOnce({
        total: poultryClaimsWithSites.length,
        claims: poultryClaimsWithSites,
      });

      const options = {
        method: "GET",
        url: `${poultryUrl}?page=1`,
        auth,
      };

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      // Should display "Number of sites" for poultry
      expect($(".govuk-summary-list__key").text()).toContain("Number of sites");

      // Should NOT display "Number of herds and flocks" for poultry
      expect($(".govuk-summary-list__key").text()).not.toContain("Number of herds and flocks");

      // Find the Number of sites row and check the value
      const sitesRow = $(".govuk-summary-list__row").filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Number of sites"),
      );
      expect(sitesRow.find(".govuk-summary-list__value").text().trim()).toBe("3");
    });

    test("counts unique sites for poultry applications", async () => {
      // Same site ID used multiple times should only count once
      const poultryClaimsWithDuplicateSites = [
        { ...poultryClaim, herd: { id: "site-1-id" } },
        { ...poultryClaim, herd: { id: "site-1-id" } },
        { ...poultryClaim, herd: { id: "site-2-id" } },
      ];

      getApplication.mockReturnValueOnce(poultryApplication);
      getClaims.mockReturnValueOnce({
        total: poultryClaimsWithDuplicateSites.length,
        claims: poultryClaimsWithDuplicateSites,
      });

      const options = {
        method: "GET",
        url: `${poultryUrl}?page=1`,
        auth,
      };

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const sitesRow = $(".govuk-summary-list__row").filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Number of sites"),
      );
      expect(sitesRow.find(".govuk-summary-list__value").text().trim()).toBe("2");
    });

    test("displays zero sites when no poultry claims have herd", async () => {
      const poultryClaimsWithoutSites = [{ ...poultryClaim, herd: undefined }];

      getApplication.mockReturnValueOnce(poultryApplication);
      getClaims.mockReturnValueOnce({
        total: poultryClaimsWithoutSites.length,
        claims: poultryClaimsWithoutSites,
      });

      const options = {
        method: "GET",
        url: `${poultryUrl}?page=1`,
        auth,
      };

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const sitesRow = $(".govuk-summary-list__row").filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Number of sites"),
      );
      expect(sitesRow.find(".govuk-summary-list__value").text().trim()).toBe("0");
    });
  });
});
