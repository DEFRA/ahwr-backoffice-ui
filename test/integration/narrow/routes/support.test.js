import Hapi from "@hapi/hapi";
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
    // server.ext("onPreAuth", (request, h) => {
    //   console.log({
    //     event: "onPreAuth",
    //     method: request.method,
    //     path: request.url.pathname,
    //     payload: request.payload,
    //     headers: request.headers,
    //     auth: request.auth,
    //     "content-type:": request.headers["content-type"],
    //   });
    //   return h.continue;
    // });
    // server.ext("onPostAuth", (request, h) => {
    //   console.log({
    //     event: "onPostAuth",
    //     method: request.method,
    //     path: request.url.pathname,
    //     payload: request.payload,
    //     headers: request.headers,
    //     "content-type:": request.headers["content-type"],
    //   });
    //   return h.continue;
    // });
    // server.ext("onPreHandler", (request, h) => {
    //   console.log({
    //     event: "onPreHandler",
    //     method: request.method,
    //     path: request.url.pathname,
    //     payload: request.payload,
    //     headers: request.headers,
    //     "content-type:": request.headers["content-type"],
    //   });
    //   return h.continue;
    // });
    // server.ext("onPostHandler", (request, h) => {
    //   console.log({
    //     event: "onPostHandler",
    //     method: request.method,
    //     path: request.url.pathname,
    //     payload: request.payload,
    //     headers: request.headers,
    //     "content-type:": request.headers["content-type"],
    //   });
    //   return h.continue;
    // });
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
    describe.only("non existing action", () => {
      it.only("returns not found", async () => {
        //** This is a sample of a minimal hapi server that shows the same issue
        // const serv2 = Hapi.server();
        // console.log("new server created");
        // serv2.ext("onPreAuth", (request, h) => {
        //   console.log({
        //     event: "onPreAuth",
        //     method: request.method,
        //     path: request.url.pathname,
        //     payload: request.payload,
        //     raw: request.raw.req,
        //     headers: request.headers,
        //     auth: request.auth,
        //     "content-type:": request.headers["content-type"],
        //   });
        //   return h.continue;
        // });
        // serv2.ext("onPostAuth", (request, h) => {
        //   console.log({
        //     event: "onPostAuth",
        //     method: request.method,
        //     path: request.url.pathname,
        //     payload: request.payload,
        //     headers: request.headers,
        //     "content-type:": request.headers["content-type"],
        //   });
        //   return h.continue;
        // });
        // serv2.ext("onPreHandler", (request, h) => {
        //   console.log({
        //     event: "onPreHandler",
        //     method: request.method,
        //     path: request.url.pathname,
        //     payload: request.payload,
        //     headers: request.headers,
        //     "content-type:": request.headers["content-type"],
        //   });
        //   return h.continue;
        // });
        // serv2.ext("onPostHandler", (request, h) => {
        //   console.log({
        //     event: "onPostHandler",
        //     method: request.method,
        //     path: request.url.pathname,
        //     payload: request.payload,
        //     headers: request.headers,
        //     "content-type:": request.headers["content-type"],
        //   });
        //   return h.continue;
        // });
        // serv2.route({
        //   method: "POST",
        //   path: "/supporty",
        //   handler: (request, h) => {
        //     return h.response({ ok: true, payload: request.payload }).code(200);
        //   },
        // });

        // const buf = Buffer.from(
        //   JSON.stringify({ applicationReference: "x", action: "delete" }),
        //   "utf8",
        // );
        // const res = await serv2.inject({
        //   method: "POST",
        //   url: "/supporty",
        //   // headers: { "content-type": "text/plain" },
        //   // payload: "something",
        //   // payload: { x: "x" },
        //   payload: buf,
        // });

        // expect(res.statusCode).toBe(200);
        // expect(JSON.parse(res.payload).payload.action).toBe("delete");
        //** END

        // wreck.get = jest.fn();
        const applicationReference = "someReference";
        const options = {
          method: "POST",
          url: "/support",
          auth: adminAuth,
          headers: { cookie: `crumb=${crumb}` },
          payload: { applicationReference: applicationReference, action: "delete" },
        };
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
        // // expect(wreck.get).toHaveBeenCalledWith(applicationReference);
      });
    });

    describe("search application", () => {
      it("shows application information when requested", async () => {
        wreck.get = jest.fn();
        const applicationReference = "someReference";
        const options = {
          method: "POST",
          url: "/support",
          auth: adminAuth,
          headers: { cookie: `crumb=${crumb}` },
          payload: { applicationReference, action: "delete" },
        };
        const response = await server.inject(options);
        expect(wreck.get).toHaveBeenCalledWith(applicationReference);
      });
    });
  });
});
