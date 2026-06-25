import * as cheerio from "cheerio";
import { axe } from "../../../helpers/axe-helper.js";
import { createServer } from "../../../../app/server.js";
import { permissions } from "../../../../app/auth/permissions.js";
import { getCrumbs } from "../../../utils/get-crumbs.js";
import { setupViewClaimRender } from "../../../utils/view-claim-render-fixtures.js";
import { STATUS } from "ffc-ahwr-common-library";
import { StatusCodes } from "http-status-codes";

const { administrator } = permissions;

jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/routes/utils/crumb-cache");
jest.mock("../../../../app/routes/utils/get-claim-view-states");
jest.mock("../../../../app/auth");

describe("update-status", () => {
  let server;
  const auth = {
    strategy: "session-auth",
    credentials: { account: {}, scope: [administrator] },
  };

  beforeAll(async () => {
    server = await createServer();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    setupViewClaimRender();
  });

  test("success: redirects to the claim view (PRG preserved on the success path)", async () => {
    const crumb = await getCrumbs(server);

    const res = await server.inject({
      method: "post",
      url: "/update-status",
      auth,
      headers: { cookie: `crumb=${crumb}` },
      payload: {
        reference: "FUSH-1010-2020",
        page: "1",
        status: STATUS.IN_CHECK,
        note: "test",
        returnPage: "claims",
        crumb,
      },
    });

    expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    expect(res.headers.location).toBe("/view-claim/FUSH-1010-2020?page=1&returnPage=claims");
  });

  test("failure: re-renders the claim view in place with the error summary, no redirect, no errors in the URL", async () => {
    const crumb = await getCrumbs(server);

    const res = await server.inject({
      method: "post",
      url: "/update-status",
      auth,
      headers: { cookie: `crumb=${crumb}` },
      payload: {
        reference: "FUSH-1010-2020",
        page: "1",
        status: STATUS.IN_CHECK,
        returnPage: "claims",
        crumb,
      },
    });
    const $ = cheerio.load(res.payload);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(res.headers.location).toBeUndefined();
    expect(res.payload).not.toContain("errors=");
    expect($(".govuk-error-summary").length).toBe(1);
    expect($(".govuk-error-summary").text()).toContain("Enter note");
    expect(await axe(res.payload)).toHaveNoViolations();
  });
});
