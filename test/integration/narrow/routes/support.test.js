import * as cheerio from "cheerio";

import { StatusCodes } from "http-status-codes";
import { permissions } from "../../../../app/auth/permissions.js";
import { createServer } from "../../../../app/server.js";
import { getCrumbs } from "../../../utils/get-crumbs.js";
import {
  getApplicationDocument,
  getClaimDocument,
  getHerdDocument,
} from "../../../../app/routes/support/support-calls.js";

const { administrator, user, processor, recommender, authoriser } = permissions;

jest.mock("../../../../app/routes/support/support-calls.js");

describe("support-routes", () => {
  const adminAuth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { name: "test admin" } },
  };

  let crumb;
  let server;

  beforeAll(async () => {
    server = await createServer({ testPort: 6001 });
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    crumb = await getCrumbs(server);
  });

  // gets just calls and gets the default view
  describe("get", () => {
    describe("support user", () => {
      let response;

      beforeEach(async () => {
        const options = {
          method: "GET",
          url: "/support",
          auth: adminAuth,
          headers: { cookie: `crumb=${crumb}` },
        };
        response = await server.inject(options);
      });

      it("shows the title", async () => {
        expect(response.statusCode).toBe(StatusCodes.OK);
        const $ = cheerio.load(response.payload);
        expect($("h1.govuk-heading-xl").text()).toContain("Support");
      });

      it("shows the application form", async () => {
        expect(response.statusCode).toBe(StatusCodes.OK);
        const $ = cheerio.load(response.payload);

        expect($("form.ahwr-application-search-form").length).toBe(1);
        expect($("form.ahwr-application-search-form").attr("action")).toBe("/support");
        expect($("#application-reference").length).toBe(1);
      });

      it("shows the claim form", async () => {
        expect(response.statusCode).toBe(StatusCodes.OK);
        const $ = cheerio.load(response.payload);
        expect($("form.ahwr-claim-search-form").length).toBe(1);
        expect($("form.ahwr-claim-search-form").attr("action")).toBe("/support");
        expect($("#claim-reference").length).toBe(1);
      });

      it("shows the herd form", async () => {
        expect(response.statusCode).toBe(StatusCodes.OK);
        const $ = cheerio.load(response.payload);
        expect($("form.ahwr-herd-search-form").length).toBe(1);
        expect($("form.ahwr-herd-search-form").attr("action")).toBe("/support");
        expect($("#herd-id").length).toBe(1);
      });
    });

    it("returns 302 for now", async () => {
      const options = {
        method: "GET",
        url: "/support",
      };
      const response = await server.inject(options);

      expect(response.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    it("returns 403 for user without admin permissions", async () => {
      const options = {
        method: "GET",
        url: "/support",
        auth: {
          strategy: "session-auth",
          credentials: {
            scope: [user, processor, recommender, authoriser],
            account: { name: "test user" },
          },
        },
      };
      const response = await server.inject(options);

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
      const $ = cheerio.load(response.payload);
      expect($("#_403").length).toBe(1);
    });
  });

  // post we will have for each possible support call
  // those calls will be made with wreck
  // Therefore we will need to mock wreck.
  describe("post", () => {
    describe("non existing action", () => {
      it("returns not found", async () => {
        const applicationReference = "someReference";
        const options = {
          method: "POST",
          url: "/support",
          auth: adminAuth,
          headers: { cookie: `crumb=${crumb}` },
          payload: { crumb, applicationReference, action: "delete" },
        };

        const response = await server.inject(options);

        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child").text()).toContain(
          "Action delete is not supported.",
        );
      });
    });

    describe("search application", () => {
      it("throws error if no application reference passed", async () => {
        const options = {
          method: "POST",
          url: "/support",
          auth: adminAuth,
          headers: { cookie: `crumb=${crumb}` },
          payload: { crumb, action: "searchApplication" },
        };
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#application-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Application reference missing.",
        );
        expect($("#applicationDocument").length).toBe(0);
      });

      it("shows application information when requested", async () => {
        getApplicationDocument.mockResolvedValue({ document: { some: "value", another: "entry" } });

        const applicationReference = "someReference";
        const options = {
          method: "POST",
          url: "/support",
          auth: adminAuth,
          headers: { cookie: `crumb=${crumb}` },
          payload: { crumb, applicationReference, action: "searchApplication" },
        };
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($("#applicationDocument").length).toBe(1);
        expect($("#applicationDocument").text()).toContain("entry");
      });
    });

    describe("search claim", () => {
      it("throws error if no claim reference passed", async () => {
        const options = {
          method: "POST",
          url: "/support",
          auth: adminAuth,
          headers: { cookie: `crumb=${crumb}` },
          payload: { crumb, action: "searchClaim" },
        };
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#claim-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Claim reference missing.",
        );
        expect($("#claimDocument").length).toBe(0);
      });

      it("shows claim information when requested", async () => {
        getClaimDocument.mockResolvedValue({ document: { some: "value", another: "entry" } });

        const claimReference = "someReference";
        const options = {
          method: "POST",
          url: "/support",
          auth: adminAuth,
          headers: { cookie: `crumb=${crumb}` },
          payload: { crumb, claimReference, action: "searchClaim" },
        };
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($("#claimDocument").length).toBe(1);
        expect($("#claimDocument").text()).toContain("entry");
      });
    });

    describe("search herd", () => {
      it("throws error if no herd reference passed", async () => {
        const options = {
          method: "POST",
          url: "/support",
          auth: adminAuth,
          headers: { cookie: `crumb=${crumb}` },
          payload: { crumb, action: "searchHerd" },
        };
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe("#herd-id");
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Herd id missing.",
        );
        expect($("#herdDocument").length).toBe(0);
      });

      it("shows herd information when requested", async () => {
        getHerdDocument.mockResolvedValue({ document: { some: "value", another: "entry" } });

        const herdId = "someReference";
        const options = {
          method: "POST",
          url: "/support",
          auth: adminAuth,
          headers: { cookie: `crumb=${crumb}` },
          payload: { crumb, herdId, action: "searchHerd" },
        };
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($("#herdDocument").length).toBe(1);
        expect($("#herdDocument").text()).toContain("entry");
      });
    });
  });
});
