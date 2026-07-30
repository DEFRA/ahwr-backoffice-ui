import * as cheerio from "cheerio";
import { getClaim, getClaimHistory, getClaims } from "../../../../app/api/claims.js";
import { getApplication } from "../../../../app/api/applications.js";
import { permissions } from "../../../../app/auth/permissions.js";
import { config } from "../../../../app/config/index.js";
import { createServer } from "../../../../app/server.js";
import { StatusCodes } from "http-status-codes";

const { administrator } = permissions;
const SUPER_ADMIN_USERNAME = "superadmin@test";

jest.mock("../../../../app/config/index.js", () => {
  const actual = jest.requireActual("../../../../app/config/index.js");
  return {
    ...actual,
    config: {
      ...actual.config,
      superAdmins: ["superadmin@test"],
      withdrawClaimEnabled: true,
    },
  };
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

const superAdminAuth = {
  strategy: "session-auth",
  credentials: {
    scope: [administrator],
    account: { name: "Super Admin", username: SUPER_ADMIN_USERNAME },
  },
};

const injectViewClaim = (server, auth) =>
  server.inject({ method: "GET", url: "/view-claim/REPI-1111-6666", auth });

describe("Withdraw claim button", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  beforeEach(() => {
    config.withdrawClaimEnabled = true;
    getClaim.mockReturnValue(claim);
    getClaims.mockReturnValue({ claims: [claim] });
    getApplication.mockReturnValue(application);
    getClaimHistory.mockResolvedValue({ historyRecords: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("shows the button for a super admin on an in check claim when the toggle is enabled", async () => {
    const res = await injectViewClaim(server, superAdminAuth);
    const $ = cheerio.load(res.payload);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect($(".govuk-button--warning").text()).toMatch("Withdraw claim");
  });

  test("the button links to the withdrawal page for the claim", async () => {
    const res = await injectViewClaim(server, superAdminAuth);
    const $ = cheerio.load(res.payload);

    expect($(".govuk-button--warning").attr("href")).toBe("/withdraw-claim/REPI-1111-6666?page=1");
  });

  test("hides the button when the toggle is disabled", async () => {
    config.withdrawClaimEnabled = false;

    const res = await injectViewClaim(server, superAdminAuth);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(res.payload).not.toContain("Withdraw claim");
  });

  test("hides the button for an administrator who is not a super admin", async () => {
    const auth = {
      strategy: "session-auth",
      credentials: {
        scope: [administrator],
        account: { name: "Plain Admin", username: "notsuperadmin@test" },
      },
    };

    const res = await injectViewClaim(server, auth);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(res.payload).not.toContain("Withdraw claim");
  });

  test("hides the button when the claim is not in check", async () => {
    getClaim.mockReturnValue({ ...claim, status: "PAID" });

    const res = await injectViewClaim(server, superAdminAuth);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(res.payload).not.toContain("Withdraw claim");
  });

  test("hides the button when the application is flagged", async () => {
    getApplication.mockReturnValue({ ...application, flags: [{ id: "flag-1" }] });

    const res = await injectViewClaim(server, superAdminAuth);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(res.payload).not.toContain("Withdraw claim");
  });
});
