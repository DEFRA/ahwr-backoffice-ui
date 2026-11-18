import * as cheerio from "cheerio";
import { permissions } from "../../../../app/auth/permissions.js";
import { getCrumbs } from "../../../utils/get-crumbs.js";
import { createServer } from "../../../../app/server.js";
import { StatusCodes } from "http-status-codes";
import { config } from "../../../../app/config/index.js";
import { getClaim, getClaimHistory, withdrawClaim } from "../../../../app/api/claims.js";
import { getApplication } from "../../../../app/api/applications.js";

const SUPER_ADMIN_USERNAME = "superadmin@test";

jest.mock("../../../../app/config/index.js", () => {
  const { asConvict } = require("../../../helpers/mock-config.js");
  const values = jest.requireActual("../../../../app/config/index.js").config.getProperties();
  values.superAdmins = ["superadmin@test"];
  values.withdrawClaimEnabled = true;
  return { config: asConvict(values) };
});
jest.mock("../../../../app/auth");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/api/applications");

const { administrator, recommender, processor, authoriser, user } = permissions;

const reference = "REBC-D9H7-BJGX";

const claim = {
  reference,
  applicationReference: "IAHW-1234-APP1",
  status: "IN_CHECK",
};

const application = {
  reference: "IAHW-1234-APP1",
  flags: [],
};

const adminAuth = {
  strategy: "session-auth",
  credentials: {
    scope: [recommender],
    account: { name: "Case Officer", username: "caseofficer@test" },
  },
};

const adminOnlyAuth = {
  strategy: "session-auth",
  credentials: {
    scope: [administrator],
    account: { name: "Plain Admin", username: "notsuperadmin@test" },
  },
};

const superAdminAuth = {
  strategy: "session-auth",
  credentials: {
    scope: [administrator],
    account: { name: "Super Admin", username: SUPER_ADMIN_USERNAME },
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

  beforeEach(() => {
    config.set("withdrawClaimEnabled", true);
    getClaim.mockResolvedValue(claim);
    getApplication.mockResolvedValue(application);
    getClaimHistory.mockResolvedValue({ historyRecords: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
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

    test("the withdrawal form prevents an accidental double click", async () => {
      const res = await server.inject({
        method: "GET",
        url: `/withdraw-claim/${reference}?page=2&returnPage=claims`,
        auth: adminAuth,
      });

      expect(cheerio.load(res.payload)).toPreventDoubleClicks(1);
    });

    test("forbids a user with no withdrawal role", async () => {
      const res = await server.inject({
        method: "GET",
        url: `/withdraw-claim/${reference}`,
        auth: { strategy: "session-auth", credentials: { scope: [user] } },
      });

      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe("withdrawal eligibility (same rules as the view-claim button)", () => {
    const getWithdrawalPage = (auth = adminAuth) =>
      server.inject({ method: "GET", url: `/withdraw-claim/${reference}`, auth });

    test.each([
      ["administrator", adminOnlyAuth],
      ["super admin", superAdminAuth],
    ])("allows an %s", async (_label, auth) => {
      const res = await getWithdrawalPage(auth);

      expect(res.statusCode).toBe(StatusCodes.OK);
    });

    const authFor = (scope) => ({
      strategy: "session-auth",
      credentials: { scope: [scope], account: { name: "Some One", username: "someone@test" } },
    });

    test.each([
      ["recommender", recommender],
      ["processor", processor],
    ])("allows a case officer (%s)", async (_label, scope) => {
      const res = await getWithdrawalPage(authFor(scope));

      expect(res.statusCode).toBe(StatusCodes.OK);
    });

    test("forbids an authoriser", async () => {
      const res = await getWithdrawalPage(authFor(authoriser));

      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    test("forbids when a withdrawal request is already pending", async () => {
      getClaim.mockResolvedValue({ ...claim, isWithdrawalRequested: true });

      const res = await getWithdrawalPage();

      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    test("forbids when the claim is not in check", async () => {
      getClaim.mockResolvedValue({ ...claim, status: "PAID" });

      const res = await getWithdrawalPage();

      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    test("forbids when the application is flagged", async () => {
      getApplication.mockResolvedValue({ ...application, flags: [{ id: "flag-1" }] });

      const res = await getWithdrawalPage();

      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    test("forbids when the withdraw claim toggle is disabled", async () => {
      config.set("withdrawClaimEnabled", false);

      const res = await getWithdrawalPage();

      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    test("forbids submitting when the claim is not in check", async () => {
      getClaim.mockResolvedValue({ ...claim, status: "PAID" });
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

    describe("with a valid submission", () => {
      let res;

      beforeEach(async () => {
        res = await postWithdrawal(validPayload);
      });

      test("submits the withdrawal request via the backend", () => {
        expect(withdrawClaim).toHaveBeenCalledWith(
          reference,
          "Case Officer",
          {
            reasonForWithdrawal: "unintentionalTypingError",
            issueDiscovery: "customerContactedRPA",
            withdrawalDetails: "Wrong date entered",
          },
          expect.anything(),
        );
      });

      test("redirects back to the claim", () => {
        expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
        expect(res.headers.location).toBe(`/view-claim/${reference}?page=2&returnPage=claims`);
      });
    });

    test("does not withdraw the claim when validation fails", async () => {
      await postWithdrawal({});

      expect(withdrawClaim).not.toHaveBeenCalled();
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
        "Enter details for why this claim should be withdrawn",
      ]);
    });

    test.each([
      ["reasonForWithdrawal", "Select a reason for withdrawal", "#reasonForWithdrawal"],
      ["issueDiscovery", "Select how the issue was discovered", "#issueDiscovery"],
      [
        "withdrawalDetails",
        "Enter details for why this claim should be withdrawn",
        "#withdrawalDetails",
      ],
    ])("fails validation when %s is missing", async (missingField, message, href) => {
      // eslint-disable-next-line sonarjs/no-unused-vars
      const { [missingField]: _, ...payload } = validPayload;
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
