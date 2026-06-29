import { permissions } from "../../../../app/auth/permissions.js";
import { getCrumbs } from "../../../utils/get-crumbs.js";
import { createServer } from "../../../../app/server.js";
import { generateNewCrumb } from "../../../../app/routes/utils/crumb-cache.js";
import { setupViewClaimRender } from "../../../utils/view-claim-render-fixtures.js";
import { StatusCodes } from "http-status-codes";

jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/routes/utils/crumb-cache");
jest.mock("../../../../app/routes/utils/get-claim-view-states");
jest.mock("../../../../app/auth");

const reference = "AHWR-555A-FD4C";
const url = "/recommend-to-pay";

const { administrator, recommender } = permissions;

describe("Recommended To Pay test", () => {
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

    test.each([recommender, administrator])(
      "Redirects correctly on successful validation for claim",
      async (scope) => {
        auth = {
          strategy: "session-auth",
          credentials: {
            scope: [scope],
            account: { homeAccountId: "testId", name: "admin" },
          },
        };
        const options = {
          method: "POST",
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
      },
    );

    test("Returns 403 when user is not administrator or recommender ", async () => {
      auth = {
        strategy: "session-auth",
        credentials: {
          scope: [],
          account: { homeAccountId: "testId", name: "admin" },
        },
      };
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          page: 1,
          confirm: ["checkedAgainstChecklist", "sentChecklist"],
          crumb,
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    test("re-renders the claim view in place on wrong payload", async () => {
      auth = {
        strategy: "session-auth",
        credentials: {
          scope: [administrator],
          account: { homeAccountId: "testId", name: "admin" },
        },
      };
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          page: 1,
          confirm: ["sentChecklist"],
          crumb,
        },
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.headers.location).toBeUndefined();
      expect(res.payload).not.toContain("errors=");
      expect(res.payload).toContain("govuk-error-summary");
    });

    test("re-renders the claim view in place on invalid reference", async () => {
      auth = {
        strategy: "session-auth",
        credentials: {
          scope: [administrator],
          account: { homeAccountId: "testId", name: "admin" },
        },
      };
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          page: 1,
          reference: 123,
          confirm: ["recommendToPay", "sentChecklist"],
          crumb,
        },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.headers.location).toBeUndefined();
      expect(res.payload).not.toContain("errors=");
      expect(res.payload).toContain("govuk-error-summary");
    });
  });
});
