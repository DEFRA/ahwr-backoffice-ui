import * as cheerio from "cheerio";
import { phaseBannerOk } from "../../../utils/phase-banner-expect.js";
import { getCrumbs } from "../../../utils/get-crumbs.js";
import { permissions } from "../../../../app/auth/permissions.js";
import { getAllFlags, createFlag, deleteFlag } from "../../../../app/api/flags";
import { flags } from "../../../data/flags.js";
import { StatusCodes } from "http-status-codes";
import { mapAuth } from "../../../../app/auth/map-auth.js";
import { createServer } from "../../../../app/server.js";

const { administrator, user } = permissions;

jest.mock("../../../../app/api/flags");
jest.mock("../../../../app/auth/map-auth");
jest.mock("../../../../app/auth");

mapAuth.mockReturnValue({ isAdministrator: true, isSuperAdmin: true });
getAllFlags.mockResolvedValue(flags);

describe("Flags tests", () => {
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { name: "test admin" } },
  };

  let crumb;
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  describe("GET /flags route", () => {
    const abcReference = {
      id: "abc123",
      applicationReference: "IAHW-U6ZE-5R5E",
      sbi: "123456789",
      note: "Flag this please",
      createdBy: "Ben",
      createdAt: "2025-04-09T12: 01: 23.322Z",
      appliesToMh: true,
      deletedAt: null,
      deletedBy: null,
      redacted: false,
    };

    beforeAll(() => {
      flags.push(abcReference);
    });

    beforeEach(async () => {
      crumb = await getCrumbs(server);
    });

    test("returns 302 when there is no auth", async () => {
      const options = {
        method: "GET",
        url: "/flags",
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("returns 200", async () => {
      const options = {
        method: "GET",
        url: "/flags",
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      phaseBannerOk($);
    });

    test("returns 200 when user is not an admin", async () => {
      const auth = {
        strategy: "session-auth",
        credentials: { scope: [user], account: { name: "test user" } },
      };

      const options = {
        method: "GET",
        url: "/flags",
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      phaseBannerOk($);
    });

    test("it does not handle errors from the url", async () => {
      const auth = {
        strategy: "session-auth",
        credentials: { scope: [user], account: { name: "test user" } },
      };

      const options = {
        method: "GET",
        url: "/flags?createFlag=true&errors=something",
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");

      expect($(".govuk-error-summary__title").html()).toBeFalsy();
      phaseBannerOk($);
    });

    test("the create form links to the flags endpoint", async () => {
      const options = {
        method: "GET",
        url: "/flags?createFlag=true",
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");

      expect($(".ahwr-update-form").attr("action")).toBe("/flags");
      phaseBannerOk($);
    });

    test("the delete form links to the flags endpoint", async () => {
      const options = {
        method: "GET",
        url: "/flags?deleteFlag=abc123",
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");

      expect($(".ahwr-update-form").attr("action")).toBe("/flags");
      phaseBannerOk($);
    });

    test("the create form is not shown when user isn't an administrator", async () => {
      mapAuth.mockReturnValueOnce({ isAdministrator: false, isSuperAdmin: false });
      const auth = {
        strategy: "session-auth",
        credentials: { scope: [user], account: { name: "test user" } },
      };
      const options = {
        method: "GET",
        url: "/flags?createFlag=true",
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");

      expect($(".ahwr-update-form").length).toBe(0);
      phaseBannerOk($);
    });

    test("the delete form is not shown when user isn't an administrator", async () => {
      mapAuth.mockReturnValueOnce({ isAdministrator: false, isSuperAdmin: false });
      const auth = {
        strategy: "session-auth",
        credentials: { scope: [user], account: { name: "test user" } },
      };
      const options = {
        method: "GET",
        url: "/flags?deleteFlag=abc123",
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");

      expect($(".ahwr-update-form").length).toBe(0);
      phaseBannerOk($);
    });
  });

  describe(`POST /flags/delete route`, () => {
    const abcReference = {
      id: "abc123",
      applicationReference: "IAHW-U6ZE-5R5E",
      sbi: "123456789",
      note: "Flag this please",
      createdBy: "Ben",
      createdAt: "2025-04-09T12: 01: 23.322Z",
      appliesToMh: true,
      deletedAt: null,
      deletedBy: null,
      redacted: false,
    };
    beforeAll(() => {
      flags.push(abcReference);
    });

    afterAll(() => {
      const i = flags.indexOf(abcReference);
      if (i !== -1) flags.splice(i, 1);
    });

    beforeEach(async () => {
      crumb = await getCrumbs(server);
    });

    test("returns 302 when there is no auth", async () => {
      const flagId = "abc123";
      const options = {
        method: "POST",
        url: `/flags`,
        payload: { flagId, action: "delete" },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("returns a 400 if the delete API call fails and redirects user back to flags page", async () => {
      deleteFlag.mockImplementationOnce(() => {
        throw new Error("deletion failed");
      });
      const flagId = "abc123";
      const options = {
        method: "POST",
        url: `/flags`,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb, deletedNote: "Flag deleted", flagId, action: "delete" },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      phaseBannerOk($);
    });

    test("redirects the user to the flags page when the flag has happily been deleted", async () => {
      deleteFlag.mockResolvedValueOnce(null);
      const flagId = "abc123";
      const options = {
        method: "POST",
        url: `/flags`,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: { crumb, deletedNote: "Flag deleted", flagId, action: "delete" },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      phaseBannerOk($);
    });

    test("renders errors when the user has not provided a deleted note value", async () => {
      const flagId = "abc123";

      const options = {
        method: "POST",
        url: `/flags`,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          flagId,
          action: "delete",
        },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe("#deletedNote");
      expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
        "Enter a note to explain the reason for removing this flag",
      );
      phaseBannerOk($);
    });

    test("renders errors when the user has not provided a long enough deleted note value", async () => {
      const flagId = "abc123";
      const options = {
        method: "POST",
        url: `/flags`,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          deletedNote: "a",
          flagId,
          action: "delete",
        },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe("#deletedNote");
      expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
        "Enter a note of at least 2 characters in length",
      );
      phaseBannerOk($);
    });

    test("it does not handle errors from the url", async () => {
      const auth = {
        strategy: "session-auth",
        credentials: { scope: [user], account: { name: "test user" } },
      };

      const options = {
        method: "GET",
        url: "/flags?deleteFlag=abc123&errors=something",
        auth,
        headers: { cookie: `crumb=${crumb}` },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");

      expect($(".govuk-error-summary__title").html()).toBeFalsy();
      phaseBannerOk($);
    });
  });

  describe(`POST /flags route`, () => {
    beforeEach(async () => {
      crumb = await getCrumbs(server);
      jest.clearAllMocks();
    });

    test("returns 302 when there is no auth", async () => {
      const options = {
        method: "POST",
        url: "/flags",
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("returns 400 when the create flag API call fails", async () => {
      createFlag.mockImplementationOnce(() => {
        let error = new Error("Random error");
        error = {
          data: {
            res: {
              statusCode: 500,
            },
          },
          message: error.message,
        };
        throw error;
      });
      const options = {
        method: "POST",
        url: "/flags",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          appRef: "IAHW-TEST-REF1",
          note: "Test flag",
          appliesToMh: "yes",
          action: "create",
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    test("returns the user to the flags page when the flag has been created", async () => {
      createFlag.mockResolvedValueOnce({ res: { statusCode: 201 } });
      const options = {
        method: "POST",
        url: "/flags",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          appRef: "IAHW-TEST-REF1",
          note: "Test flag",
          appliesToMh: "yes",
          action: "create",
        },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(createFlag).toHaveBeenCalledWith(
        { appliesToMh: true, note: "Test flag", user: "test admin" },
        "IAHW-TEST-REF1",
        expect.any(Object),
      );
    });

    test("renders errors when the user has not provided the proper appliesToMh value", async () => {
      const options = {
        method: "POST",
        url: "/flags",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          appRef: "IAHW-TEST-REF1",
          note: "Test flag",
          appliesToMh: "something",
          action: "create",
        },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe("#appliesToMh");
      expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
        "Select if the flag is because the user declined multiple herds T&C's.",
      );
      phaseBannerOk($);
    });

    test("renders errors when the user has not provided the proper appRef value", async () => {
      const options = {
        method: "POST",
        url: "/flags",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          appRef: "IAHW-TEST-RE",
          note: "Test flag",
          appliesToMh: "yes",
          action: "create",
        },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
        "#agreement-reference",
      );
      expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
        "Enter a valid agreement reference.",
      );
      phaseBannerOk($);
    });

    test("renders errors when the user has not provided the proper note value", async () => {
      const options = {
        method: "POST",
        url: "/flags",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          appRef: "IAHW-TEST-REF1",
          note: "",
          appliesToMh: "yes",
          action: "create",
        },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe("#note");
      expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
        "Enter a note to explain the reason for creating the flag.",
      );
      phaseBannerOk($);
    });

    test("renders an error when the user is trying to create a flag which already exists", async () => {
      createFlag.mockImplementationOnce(() => {
        let error = new Error("Flag already exists");
        error = {
          data: {
            res: {
              statusCode: 204,
            },
          },
          message: error.message,
        };
        throw error;
      });
      const options = {
        method: "POST",
        url: "/flags",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          appRef: "IAHW-TEST-REF1",
          note: "To be flagged",
          appliesToMh: "yes",
          action: "create",
        },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
        "#agreement-reference",
      );
      expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
        'Flag not created - agreement flag with the same "Flag applies to multiple herds T&C\'s" value already exists.',
      );
      phaseBannerOk($);
    });

    test("renders an error when the user is trying to create a flag with a reference that doesnt exist", async () => {
      createFlag.mockImplementationOnce(() => {
        let error = new Error("Flag does not exist");
        error = {
          data: {
            res: {
              statusCode: 404,
            },
          },
          message: error.message,
        };
        throw error;
      });
      const options = {
        method: "POST",
        url: "/flags",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          appRef: "IAHW-TEST-REF1",
          note: "To be flagged",
          appliesToMh: "yes",
          action: "create",
        },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
        "#agreement-reference",
      );
      expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
        "Agreement reference does not exist.",
      );
      phaseBannerOk($);
    });

    test("renders an error when the user is trying to create a flag for an agreement that is redacted", async () => {
      createFlag.mockImplementationOnce(() => {
        const error = {
          data: {
            payload: {
              message: "Unable to create flag for redacted agreement",
            },
            res: {
              statusCode: 400,
            },
          },
          isBoom: true,
        };

        throw error;
      });
      const options = {
        method: "POST",
        url: "/flags",
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          appRef: "IAHW-TEST-REF1",
          note: "To be flagged",
          appliesToMh: "yes",
          action: "create",
        },
      };
      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const $ = cheerio.load(res.payload);
      expect($("h1.govuk-heading-l").text()).toContain("Flags");
      expect($("title").text()).toContain("AHWR Flags");
      expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
        "#agreement-reference",
      );
      expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
        "Flag not created - agreement is redacted.",
      );
      phaseBannerOk($);
    });
  });
});
