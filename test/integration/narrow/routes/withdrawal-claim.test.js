import * as cheerio from "cheerio";
import { permissions } from "../../../../app/auth/permissions.js";
import { getCrumbs } from "../../../utils/get-crumbs.js";
import { createServer } from "../../../../app/server.js";
import { StatusCodes } from "http-status-codes";

jest.mock("../../../../app/auth");

const { administrator, user } = permissions;

const reference = "REBC-D9H7-BJGX";

const adminAuth = {
  strategy: "session-auth",
  credentials: {
    scope: [administrator],
    account: { name: "Super Admin", username: "superadmin@test" },
  },
};

describe("Withdrawal claim page", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe(`GET /withdraw-claim/${reference}`, () => {
    test("renders the confirm withdrawal page", async () => {
      const res = await server.inject({
        method: "GET",
        url: `/withdraw-claim/${reference}?page=2&returnPage=claims`,
        auth: adminAuth,
      });
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect($("h1").text()).toContain("Confirm withdrawal of this claim");
      expect(res.payload).toContain(`Claim number:`);
      expect(res.payload).toContain(reference);
      expect(res.payload).toContain("Once approved, a withdrawn claim cannot be undone.");
      expect(res.payload).toContain("Reason for withdrawal");
      expect(res.payload).toContain("How the issue was discovered");
      expect($("textarea#withdrawalDetails").length).toBe(1);
      expect($(".govuk-button--warning").text()).toContain("Withdraw claim");
      expect($(".govuk-button--secondary").text()).toContain("Do not withdraw claim");
    });

    test("both buttons lead back to the view-claim page we came from", async () => {
      const res = await server.inject({
        method: "GET",
        url: `/withdraw-claim/${reference}?page=2&returnPage=claims`,
        auth: adminAuth,
      });
      const $ = cheerio.load(res.payload);

      const viewClaimUrl = `/view-claim/${reference}?page=2&returnPage=claims`;
      expect($("form").attr("action")).toBe(`/withdraw-claim/${reference}`);
      expect($(".govuk-button--secondary").attr("href")).toBe(viewClaimUrl);
      expect($(".govuk-back-link").attr("href")).toBe(viewClaimUrl);
    });

    test("forbids a non-administrator", async () => {
      const res = await server.inject({
        method: "GET",
        url: `/withdraw-claim/${reference}`,
        auth: { strategy: "session-auth", credentials: { scope: [user] } },
      });

      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe(`POST /withdraw-claim/${reference}`, () => {
    test("redirects back to the view-claim page we came from", async () => {
      const crumb = await getCrumbs(server);
      const res = await server.inject({
        method: "POST",
        url: `/withdraw-claim/${reference}`,
        auth: adminAuth,
        payload: {
          page: "2",
          returnPage: "claims",
          reasonForWithdrawal: "unintentionalTypingError",
          issueDiscovery: "customerContactedRPA",
          withdrawalDetails: "Wrong date entered",
          crumb,
        },
        headers: { cookie: `crumb=${crumb}` },
      });

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toBe(`/view-claim/${reference}?page=2&returnPage=claims`);
    });
  });
});
