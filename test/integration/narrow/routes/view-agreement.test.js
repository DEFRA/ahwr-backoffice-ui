import * as cheerio from "cheerio";
import { axe } from "../../../helpers/axe-helper.js";
import { permissions } from "../../../../app/auth/permissions.js";
import { oldWorldApplication } from "../../../data/ow-application.js";
import { getApplication, getOldWorldApplicationHistory } from "../../../../app/api/applications.js";
import { getContactHistory, displayContactHistory } from "../../../../app/api/contact-history.js";
import { getClaimViewStates } from "../../../../app/routes/utils/get-claim-view-states.js";
import { createServer } from "../../../../app/server.js";
import { StatusCodes } from "http-status-codes";

const { administrator } = permissions;

jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/api/contact-history");
jest.mock("../../../../app/routes/utils/get-claim-view-states");
jest.mock("../../../../app/auth");

describe("View agreement (old world) test", () => {
  const url = "/view-agreement/AHWR-B571-6E79";
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { username: "test user" } },
  };

  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    getApplication.mockReturnValue(oldWorldApplication);
    getOldWorldApplicationHistory.mockReturnValue({ historyRecords: [] });
    getContactHistory.mockReturnValue([]);
    displayContactHistory.mockReturnValue({
      email: "NA",
      orgEmail: "NA",
      farmerName: "NA",
      address: "NA",
    });
    getClaimViewStates.mockReturnValue({});
  });

  test("returns 302 no auth", async () => {
    const res = await server.inject({ method: "GET", url });
    expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
  });

  test("returns 200 and is accessible, with no error summary on a clean GET", async () => {
    const res = await server.inject({ method: "GET", url, auth });
    const $ = cheerio.load(res.payload);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(await axe(res.payload)).toHaveNoViolations();
    expect($(".govuk-error-summary").length).toBe(0);
  });

  test("renders the Change action links when the user can edit the agreement", async () => {
    getClaimViewStates.mockReturnValue({
      updateVetsNameAction: true,
      updateVetRCVSNumberAction: true,
      updateDateOfVisitAction: true,
      updateEligiblePiiRedactionAction: true,
    });

    const res = await server.inject({ method: "GET", url, auth });
    const $ = cheerio.load(res.payload);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(await axe(res.payload)).toHaveNoViolations();
    expect($(".govuk-summary-list__actions").text()).toContain("Change");
  });

  test("ignores an errors query parameter added manually to the URL", async () => {
    const injected = Buffer.from(
      JSON.stringify([{ text: "Injected link", href: "#x", key: "y" }]),
    ).toString("base64");

    const res = await server.inject({ method: "GET", url: `${url}?errors=${injected}`, auth });
    const $ = cheerio.load(res.payload);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect($(".govuk-error-summary").length).toBe(0);
    expect(res.payload).not.toContain("Injected link");
  });
});
