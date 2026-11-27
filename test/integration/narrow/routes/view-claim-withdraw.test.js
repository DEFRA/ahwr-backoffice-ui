import * as cheerio from "cheerio";
import { getClaim, getClaimHistory, getClaims } from "../../../../app/api/claims.js";
import { getApplication } from "../../../../app/api/applications.js";
import { permissions } from "../../../../app/auth/permissions.js";
import { config } from "../../../../app/config/index.js";
import { createServer } from "../../../../app/server.js";
import { StatusCodes } from "http-status-codes";

const { administrator, recommender, processor, authoriser, user } = permissions;
const SUPER_ADMIN_USERNAME = "superadmin@test";

jest.mock("../../../../app/config/index.js", () => {
  const { asConvict } = require("../../../helpers/mock-config.js");
  const values = jest.requireActual("../../../../app/config/index.js").config.getProperties();
  values.superAdmins = ["superadmin@test"];
  values.withdrawClaimEnabled = true;
  values.withdrawalRequestEnabled = true;
  return { config: asConvict(values) };
});
jest.mock("../../../../app/auth");
jest.mock("../../../../app/session");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/api/applications");
jest.mock("@hapi/wreck", () => ({
  get: jest.fn().mockResolvedValue({ payload: [] }),
}));

const application = {
  reference: "IAHW-1234-APP1",
  organisation: {
    sbi: "113494460",
    name: "Test Farm Lodge",
    email: "farm@test.com",
    orgEmail: "org@test.com",
    address: "WHITE HOUSE FARM,HR2 8AN,United Kingdom",
    farmerName: "Russell Paul Davies",
  },
  createdAt: "2024-03-22T12:19:04.696Z",
  flags: [],
  redacted: false,
};

const claim = {
  id: "58b297c9-c983-475c-8bdb-db5746899cec",
  reference: "REPI-1111-6666",
  applicationReference: "IAHW-1234-APP1",
  data: {
    claimType: "R",
    typeOfLivestock: "pigs",
    vetsName: "Vet one",
    dateOfVisit: "2024-03-22T00:00:00.000Z",
    dateOfTesting: "2024-03-22T00:00:00.000Z",
    vetRCVSNumber: "1233211",
    laboratoryURN: "123456",
    speciesNumbers: "yes",
    numberOfOralFluidSamples: "6",
    numberAnimalsTested: "40",
    testResults: "positive",
  },
  type: "REVIEW",
  createdAt: "2024-03-25T12:20:18.307Z",
  status: "IN_CHECK",
};

const buildAuth = (scope, name, username) => ({
  strategy: "session-auth",
  credentials: { scope: [scope], account: { name, username } },
});

const withdrawerAuth = buildAuth(recommender, "Case Officer", "caseofficer@test");
const adminOnlyAuth = buildAuth(administrator, "Plain Admin", "notsuperadmin@test");
const superAdminAuth = buildAuth(administrator, "Super Admin", SUPER_ADMIN_USERNAME);

const injectViewClaim = (server, auth) =>
  server.inject({ method: "GET", url: "/view-claim/REPI-1111-6666", auth });

describe("Withdraw claim button", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  beforeEach(() => {
    config.set("withdrawClaimEnabled", true);
    config.set("withdrawalRequestEnabled", true);
    getClaim.mockReturnValue(claim);
    getClaims.mockReturnValue({ claims: [claim] });
    getApplication.mockReturnValue(application);
    getClaimHistory.mockResolvedValue({ historyRecords: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("shows the button for a case officer on an in check claim when the toggle is enabled", async () => {
    const res = await injectViewClaim(server, withdrawerAuth);
    const $ = cheerio.load(res.payload);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect($(".govuk-button--warning").text()).toMatch("Withdraw claim");
  });

  test("the button links to the withdrawal page for the claim", async () => {
    const res = await injectViewClaim(server, withdrawerAuth);
    const $ = cheerio.load(res.payload);

    expect($(".govuk-button--warning").attr("href")).toBe("/withdraw-claim/REPI-1111-6666?page=1");
  });

  test("hides the button when the toggle is disabled", async () => {
    config.set("withdrawClaimEnabled", false);

    const res = await injectViewClaim(server, withdrawerAuth);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(res.payload).not.toContain("Withdraw claim");
  });

  test.each([
    ["recommender", recommender],
    ["processor", processor],
    ["user", user],
  ])("shows the button for a case officer (%s)", async (_label, scope) => {
    const res = await injectViewClaim(server, buildAuth(scope, "Some One", "someone@test"));

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(cheerio.load(res.payload)(".govuk-button--warning").text()).toMatch("Withdraw claim");
  });

  test("hides the button for an authoriser", async () => {
    const res = await injectViewClaim(server, buildAuth(authoriser, "Some One", "someone@test"));

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(res.payload).not.toContain("Withdraw claim");
  });

  test.each([
    ["administrator", adminOnlyAuth],
    ["super admin", superAdminAuth],
  ])("shows the button for an %s", async (_label, auth) => {
    const res = await injectViewClaim(server, auth);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(cheerio.load(res.payload)(".govuk-button--warning").text()).toMatch("Withdraw claim");
  });

  test("hides the button when a withdrawal request is already pending", async () => {
    getClaim.mockReturnValue({ ...claim, isWithdrawalRequested: true });

    const res = await injectViewClaim(server, withdrawerAuth);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(res.payload).not.toContain("Withdraw claim");
  });

  test("hides the button when the claim is not in check", async () => {
    getClaim.mockReturnValue({ ...claim, status: "PAID" });

    const res = await injectViewClaim(server, withdrawerAuth);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(res.payload).not.toContain("Withdraw claim");
  });

  test("hides the button when the application is flagged", async () => {
    getApplication.mockReturnValue({ ...application, flags: [{ id: "flag-1" }] });

    const res = await injectViewClaim(server, withdrawerAuth);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(res.payload).not.toContain("Withdraw claim");
  });

  describe("when withdrawalRequestEnabled is off (pre AHWR-2298 behaviour)", () => {
    beforeEach(() => {
      config.set("withdrawalRequestEnabled", false);
    });

    test("shows the button for a super admin", async () => {
      const res = await injectViewClaim(server, superAdminAuth);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(cheerio.load(res.payload)(".govuk-button--warning").text()).toMatch("Withdraw claim");
    });

    test.each([
      ["case officer (recommender)", withdrawerAuth],
      ["administrator who is not a super admin", adminOnlyAuth],
      ["user", buildAuth(user, "Some One", "someone@test")],
    ])("hides the button for a %s", async (_label, auth) => {
      const res = await injectViewClaim(server, auth);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.payload).not.toContain("Withdraw claim");
    });

    test("ignores a pending withdrawal request flag on the claim", async () => {
      getClaim.mockReturnValue({ ...claim, isWithdrawalRequested: true });

      const res = await injectViewClaim(server, superAdminAuth);

      expect(cheerio.load(res.payload)(".govuk-button--warning").text()).toMatch("Withdraw claim");
    });
  });
});

describe("Withdraw claim without authorization flow", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  beforeEach(() => {
    config.set("withdrawClaimEnabled", true);
    config.set("withdrawalRequestEnabled", false);
    getClaims.mockReturnValue({ claims: [claim] });
    getApplication.mockReturnValue(application);
    getClaimHistory.mockResolvedValue({ historyRecords: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("when 'isWithdrawalRequested' not set, show the correct claim status", async () => {
    getClaim.mockReturnValue({ ...claim, status: "Withdrawn" });
    const res = await injectViewClaim(server, withdrawerAuth);
    const $ = cheerio.load(res.payload);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(
      $(
        "main#main-content > div:nth-child(2).govuk-grid-row > div:nth-child(2) > span > div",
      ).text(),
    ).toMatch("Withdrawn");
    expect(
      $(
        "main#main-content > div:nth-child(4).govuk-grid-row > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > dl:nth-child(2) > div:nth-child(1) > dd:nth-child(2) > span > span",
      ).text(),
    ).toMatch("Withdrawn");
  });

  test("when 'isWithdrawalRequested' = true, show the correct claim status", async () => {
    getClaim.mockReturnValue({ ...claim, status: "Withdrawn", isWithdrawalRequested: true });
    const res = await injectViewClaim(server, withdrawerAuth);
    const $ = cheerio.load(res.payload);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(
      $(
        "main#main-content > div:nth-child(2).govuk-grid-row > div:nth-child(2) > span > div",
      ).text(),
    ).toMatch("Withdrawn");
    expect(
      $(
        "main#main-content > div:nth-child(4).govuk-grid-row > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > dl:nth-child(2) > div:nth-child(1) > dd:nth-child(2) > span > span",
      ).text(),
    ).toMatch("Withdrawn");
  });

  test("when 'isWithdrawalRequested' = false, show the correct claim status", async () => {
    getClaim.mockReturnValue({ ...claim, status: "Withdrawn", isWithdrawalRequested: false });
    const res = await injectViewClaim(server, withdrawerAuth);
    const $ = cheerio.load(res.payload);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(
      $(
        "main#main-content > div:nth-child(2).govuk-grid-row > div:nth-child(2) > span > div",
      ).text(),
    ).toMatch("Withdrawn");
    expect(
      $(
        "main#main-content > div:nth-child(4).govuk-grid-row > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > dl:nth-child(2) > div:nth-child(1) > dd:nth-child(2) > span > span",
      ).text(),
    ).toMatch("Withdrawn");
  });

  test("should not show [Changes pending approval] information, withdrawal requested", async () => {
    getClaim.mockReturnValue({ ...claim, status: "Withdrawn", isWithdrawalRequested: true });
    const res = await injectViewClaim(server, withdrawerAuth);
    const $ = cheerio.load(res.payload);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect($("h2.govuk-notification-banner__title").text()).toMatch("");
    expect($("span.govuk-heading-s").text()).toMatch("");

    let BASE_TAG = "main#main-content > div:nth-child(3) > div:nth-child(1) > div";

    expect(
      $(
        BASE_TAG + " > div.govuk-notification-banner__header > h2.govuk-notification-banner__title",
      ).text(),
    ).toMatch("");
    expect(
      $(BASE_TAG + " > div.govuk-notification-banner__content > span.govuk-heading-s").text(),
    ).toMatch("");

    BASE_TAG = "main#main-content > div:nth-child(3) > div:nth-child(2)";

    expect($(BASE_TAG + " > span:nth-child(1).govuk-heading-s").text()).toMatch("");
    expect($(BASE_TAG + " > div:nth-child(2).govuk-tag").text()).toMatch("");
    expect($(BASE_TAG + " > span:nth-child(3).govuk-heading-s").text()).toMatch("");
    expect($(BASE_TAG + " > div:nth-child(4).govuk-tag").text()).toMatch("");

    BASE_TAG =
      "main#main-content > div:nth-child(5) > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > dl:nth-child(2) > div:nth-child(1) > dd.govuk-summary-list__value > div:nth-child(1).govuk-grid-column-two-thirds";

    expect($(BASE_TAG + " > span:nth-child(1).govuk-heading-s").text()).toMatch("");
    expect($(BASE_TAG + " > div:nth-child(2).govuk-tag").text()).toMatch("");
    expect($(BASE_TAG + " > span:nth-child(3).govuk-heading-s").text()).toMatch("");
    expect($(BASE_TAG + " > div:nth-child(4).govuk-tag").text()).toMatch("");
  });
});

describe("Withdraw claim with authorization workflow: Claim page - withdrawal requested, pending approval", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  beforeEach(() => {
    config.set("withdrawClaimEnabled", true);
    config.set("withdrawalRequestEnabled", true);
    getClaim.mockReturnValue({ ...claim, isWithdrawalRequested: true });
    getClaims.mockReturnValue({ claims: [claim] });
    getApplication.mockReturnValue(application);
    getClaimHistory.mockResolvedValue({ historyRecords: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("show [Changes pending approval] message panel", async () => {
    const res = await injectViewClaim(server, withdrawerAuth);
    const $ = cheerio.load(res.payload);

    expect(res.statusCode).toBe(StatusCodes.OK);
    const BASE_TAG = "main#main-content > div:nth-child(3) > div:nth-child(1) > div";

    expect(
      $(
        BASE_TAG + " > div.govuk-notification-banner__header > h2.govuk-notification-banner__title",
      ).text(),
    ).toMatch("Important");
    expect(
      $(BASE_TAG + " > div.govuk-notification-banner__content > span.govuk-heading-s").text(),
    ).toMatch("Changes pending approval.");
  });

  test("show [Change to: Withdrawn] & [Change from: In check] texts and icons below claim number", async () => {
    const res = await injectViewClaim(server, withdrawerAuth);
    const $ = cheerio.load(res.payload);

    expect(res.statusCode).toBe(StatusCodes.OK);
    const BASE_TAG = "main#main-content > div:nth-child(3) > div:nth-child(2)";

    expect($(BASE_TAG + " > span:nth-child(1).govuk-heading-s").text()).toMatch("Change to:");
    expect($(BASE_TAG + " > div:nth-child(2).govuk-tag").text()).toMatch("Withdrawn");
    expect($(BASE_TAG + " > span:nth-child(3).govuk-heading-s").text()).toMatch("Change from:");
    expect($(BASE_TAG + " > div:nth-child(4).govuk-tag").text()).toMatch("In check");
  });

  test("show [Change to: Withdrawn] & [Change from: In check] texts and icons in Claim details status", async () => {
    const res = await injectViewClaim(server, withdrawerAuth);
    const $ = cheerio.load(res.payload);

    expect(res.statusCode).toBe(StatusCodes.OK);
    const BASE_TAG =
      "main#main-content > div:nth-child(5) > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > dl:nth-child(2) > div:nth-child(1) > dd.govuk-summary-list__value > div:nth-child(1).govuk-grid-column-two-thirds";

    expect($(BASE_TAG + " > span:nth-child(1).govuk-heading-s").text()).toMatch("Change to:");
    expect($(BASE_TAG + " > div:nth-child(2).govuk-tag").text()).toMatch("Withdrawn");
    expect($(BASE_TAG + " > span:nth-child(3).govuk-heading-s").text()).toMatch("Change from:");
    expect($(BASE_TAG + " > div:nth-child(4).govuk-tag").text()).toMatch("In check");
  });

  test("should not show pending claim info when 'withdrawClaimEnabled' flag is off", async () => {
    const res = await injectViewClaim(server, withdrawerAuth);
    const $ = cheerio.load(res.payload);

    expect(res.statusCode).toBe(StatusCodes.OK);

    let BASE_TAG = "main#main-content > div:nth-child(3) > div:nth-child(1) > div";

    expect(
      $(
        BASE_TAG + " > div.govuk-notification-banner__header > h2.govuk-notification-banner__title",
      ).text(),
    ).toMatch("");
    expect(
      $(BASE_TAG + " > div.govuk-notification-banner__content > span.govuk-heading-s").text(),
    ).toMatch("");

    BASE_TAG = "main#main-content > div:nth-child(3) > div:nth-child(2)";

    expect($(BASE_TAG + " > span:nth-child(1).govuk-heading-s").text()).toMatch("");
    expect($(BASE_TAG + " > div:nth-child(2).govuk-tag").text()).toMatch("");
    expect($(BASE_TAG + " > span:nth-child(3).govuk-heading-s").text()).toMatch("");
    expect($(BASE_TAG + " > div:nth-child(4).govuk-tag").text()).toMatch("");

    BASE_TAG =
      "main#main-content > div:nth-child(5) > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > dl:nth-child(2) > div:nth-child(1) > dd.govuk-summary-list__value > div:nth-child(1).govuk-grid-column-two-thirds";

    expect($(BASE_TAG + " > span:nth-child(1).govuk-heading-s").text()).toMatch("");
    expect($(BASE_TAG + " > div:nth-child(2).govuk-tag").text()).toMatch("");
    expect($(BASE_TAG + " > span:nth-child(3).govuk-heading-s").text()).toMatch("");
    expect($(BASE_TAG + " > div:nth-child(4).govuk-tag").text()).toMatch("");
  });
});
