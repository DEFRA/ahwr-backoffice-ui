import * as cheerio from "cheerio";
import { axe } from "../../../helpers/axe-helper.js";
import { getCrumbs } from "../../../utils/get-crumbs.js";
import { permissions } from "../../../../app/auth/permissions.js";
import { getClaims } from "../../../../app/api/claims.js";
import {
  getApplication,
  getOldWorldApplicationHistory,
  updateEligiblePiiRedaction,
} from "../../../../app/api/applications.js";
import { getContactHistory, displayContactHistory } from "../../../../app/api/contact-history.js";
import { getClaimViewStates } from "../../../../app/routes/utils/get-claim-view-states.js";
import { getPagination, getPagingData } from "../../../../app/pagination.js";
import { createServer } from "../../../../app/server.js";
import { applicationsData } from "../../../data/applications.js";
import { oldWorldApplication } from "../../../data/ow-application.js";
import { StatusCodes } from "http-status-codes";

jest.mock("../../../../app/session");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/api/contact-history");
jest.mock("../../../../app/pagination");
jest.mock("../../../../app/routes/models/claim-list");
jest.mock("../../../../app/routes/utils/get-claim-view-states");
jest.mock("../../../../app/auth");

getPagination.mockReturnValue({ limit: 10, offset: 0 });
getPagingData.mockReturnValue({ page: 1, totalPages: 1, total: 1, limit: 10 });

const { administrator } = permissions;

describe("get-applications-to-redact", () => {
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { username: "test user" } },
  };

  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  describe("POST /agreements/{ref}/eligible-pii-redaction", () => {
    let crumb;
    const url = "/agreements/IAHW-U6ZE-5R5E/eligible-pii-redaction";

    beforeEach(async () => {
      crumb = await getCrumbs(server);
      jest.clearAllMocks();
      getClaims.mockReturnValue({ claims: [], total: 0 });
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
      const options = {
        method: "POST",
        url,
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("updates eligible pii redaction and redirects to new world agreement when new world reference", async () => {
      updateEligiblePiiRedaction.mockResolvedValueOnce();
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          page: 1,
          note: "Investigating issue",
          reference: "IAHW-U6ZE-5R5E",
          eligiblePiiRedaction: "yes",
        },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toBe("/agreement/IAHW-U6ZE-5R5E/claims?page=1");
    });

    test("updates eligible pii redaction and redirects to old world agreement when old world reference", async () => {
      updateEligiblePiiRedaction.mockResolvedValueOnce();
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          page: 1,
          note: "Investigating issue",
          reference: "AHWR-U6ZE-5R5E",
          eligiblePiiRedaction: "yes",
        },
      };

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(res.headers.location).toBe("/view-agreement/AHWR-U6ZE-5R5E?page=1");
    });

    test("re-renders the new world agreement view in place with errors when new world reference", async () => {
      getApplication.mockReturnValue(applicationsData.applications[0]);
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          page: 1,
          reference: "IAHW-U6ZE-5R5E",
          eligiblePiiRedaction: "yes",
        },
      };

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.headers.location).toBeUndefined();
      expect(res.payload).not.toContain("errors=");
      expect($(".govuk-error-summary").text()).toContain("Enter note");
      expect(await axe(res.payload)).toHaveNoViolations();
    });

    test("re-renders the old world agreement view in place with errors when old world reference", async () => {
      getApplication.mockReturnValue(oldWorldApplication);
      getOldWorldApplicationHistory.mockReturnValue({ historyRecords: [] });
      const options = {
        method: "POST",
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          crumb,
          page: 1,
          reference: "AHWR-U6ZE-5R5E",
          eligiblePiiRedaction: "yes",
        },
      };

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.headers.location).toBeUndefined();
      expect(res.payload).not.toContain("errors=");
      expect($(".govuk-error-summary").text()).toContain("Enter note");
    });
  });
});
