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
      expect($("textarea#withdrawalDetails")).toHaveLength(1);
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
    const postWithdrawal = async (payload) => {
      const crumb = await getCrumbs(server);
      return server.inject({
        method: "POST",
        url: `/withdraw-claim/${reference}`,
        auth: adminAuth,
        payload: { page: "2", returnPage: "claims", ...payload, crumb },
        headers: { cookie: `crumb=${crumb}` },
      });
    };

    const validPayload = {
      reasonForWithdrawal: "unintentionalTypingError",
      issueDiscovery: "customerContactedRPA",
      withdrawalDetails: "Wrong date entered",
    };

    test("redirects back to the view-claim page we came from", async () => {
      const res = await postWithdrawal(validPayload);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toBe(`/view-claim/${reference}?page=2&returnPage=claims`);
    });

    test("fails validation and lists every missing field when nothing is filled in", async () => {
      const res = await postWithdrawal({});
      const $ = cheerio.load(res.payload);
      const summaryErrors = $(".govuk-error-summary__list a")
        .map((_, el) => $(el).text().trim())
        .get();

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(summaryErrors).toEqual([
        "Select a reason for withdrawal",
        "Select how the issue was discovered",
        "Enter details on why this claim should be withdrawn",
      ]);
    });

    test.each([
      ["reasonForWithdrawal", "Select a reason for withdrawal", "#reasonForWithdrawal"],
      ["issueDiscovery", "Select how the issue was discovered", "#issueDiscovery"],
      [
        "withdrawalDetails",
        "Enter details on why this claim should be withdrawn",
        "#withdrawalDetails",
      ],
    ])("fails validation when %s is missing", async (missingField, message, href) => {
      const { [missingField]: _removed, ...payload } = validPayload;
      const res = await postWithdrawal(payload);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect($(`.govuk-error-summary__list a[href="${href}"]`).text().trim()).toBe(message);
    });

    test("re-renders the page keeping the values that were entered", async () => {
      const res = await postWithdrawal({
        reasonForWithdrawal: "unintentionalTypingError",
        issueDiscovery: "customerContactedRPA",
      });
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(
        $("input[name='reasonForWithdrawal'][value='unintentionalTypingError']").is(":checked"),
      ).toBe(true);
      expect($("input[name='issueDiscovery'][value='customerContactedRPA']").is(":checked")).toBe(
        true,
      );
    });
  });
});
