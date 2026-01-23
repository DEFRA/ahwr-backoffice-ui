import * as cheerio from "cheerio";
import wreck from "@hapi/wreck";

import { StatusCodes } from "http-status-codes";
import { permissions } from "../../../../app/auth/permissions.js";
import { createServer } from "../../../../app/server.js";
import { getCrumbs } from "../../../utils/get-crumbs.js";

const { administrator, user, processor, recommender, authoriser } = permissions;

jest.mock("@hapi/wreck");

const mockError = jest.fn(() => {});
const mockLogger = {
  info: jest.fn(() => {}),
  warn: jest.fn(() => {}),
  error: mockError,
  debug: jest.fn(() => {}),
  setBindings: jest.fn(() => {}),
};

const mockDb = {};

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
  describe("post", () => {});
});
