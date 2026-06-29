import { StatusCodes } from "http-status-codes";
import { permissions } from "../../../../app/auth/permissions.js";
import { generateNewCrumb } from "../../../../app/routes/utils/crumb-cache.js";
import { createServer } from "../../../../app/server.js";
import { getCrumbs } from "../../../utils/get-crumbs.js";
import { setupViewClaimRender } from "../../../utils/view-claim-render-fixtures.js";

const { administrator, recommender } = permissions;

jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/routes/utils/crumb-cache");
jest.mock("../../../../app/routes/utils/get-claim-view-states");
jest.mock("../../../../app/auth");

const reference = "AHWR-555A-FD4C";
const url = "/recommend-to-reject";

describe("Recommended To Reject test", () => {
  let crumb;

  let auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator] },
  };

  let server;

  beforeAll(async () => {
    jest.clearAllMocks();
    server = await createServer();
  });

  beforeEach(async () => {
    crumb = await getCrumbs(server);
    jest.clearAllMocks();
    setupViewClaimRender();
  });

  describe(`POST ${url} route`, () => {
    test("returns 302 no auth", async () => {
      const options = {
        method: "POST",
        url,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("re-renders the claim view in place when validation fails for claim", async () => {
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          page: 1,
          returnPage: "claims",
          confirm: "checkedAgainstChecklist",
          crumb,
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.headers.location).toBeUndefined();
      expect(res.payload).not.toContain("errors=");
      expect(res.payload).toContain("govuk-error-summary");
    });

    test.each([
      [recommender, "recommender"],
      [administrator, "recommender"],
    ])("Redirects correctly on successful validation for claim", async (scope, role) => {
      auth = {
        strategy: "session-auth",
        credentials: {
          scope: [scope],
          account: { homeAccountId: "testId", name: "admin" },
        },
      };
      const options = {
        method: "post",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          page: 1,
          returnPage: "claims",
          confirm: ["checkedAgainstChecklist", "sentChecklist"],
          crumb,
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(generateNewCrumb).toHaveBeenCalledTimes(1);
      expect(res.headers.location).toEqual(`/view-claim/${reference}?page=1&returnPage=claims`);
    });
  });
});
