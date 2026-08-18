import { permissions } from "../../../../app/auth/permissions.js";
import { getPagination } from "../../../../app/pagination.js";
import { getApplications } from "../../../../app/api/applications.js";
import { applicationsData } from "../../../data/applications.js";
import { createServer } from "../../../../app/server.js";
import { StatusCodes } from "http-status-codes";

jest.mock("../../../../app/session");
jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/pagination");
jest.mock("../../../../app/auth");

const { administrator } = permissions;

getPagination.mockReturnValue({ limit: 10, offset: 0 });
getApplications.mockReturnValue(applicationsData);

// server.inject keeps no cookie jar, so the browser's crumb cookie is threaded through by hand
const crumbCookie = (response) =>
  (response.headers["set-cookie"] ?? []).find((cookie) => cookie.startsWith("crumb="));

const crumbValue = (response) => /crumb=([^;]*)/.exec(crumbCookie(response) ?? "")?.[1];

describe("CSRF crumb", () => {
  const url = "/agreements";
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { username: "test user" } },
  };

  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  const renderPage = (crumb) =>
    server.inject({
      method: "GET",
      url,
      auth,
      ...(crumb && { headers: { cookie: `crumb=${crumb}` } }),
    });

  const submitSearch = ({ formCrumb, cookie }) =>
    server.inject({
      method: "POST",
      url,
      auth,
      payload: { submit: "advancedSearch", crumb: formCrumb },
      headers: { cookie: `crumb=${cookie}` },
    });

  test("issues no new crumb when a page is rendered again", async () => {
    const firstRender = await renderPage();

    const secondRender = await renderPage(crumbValue(firstRender));

    expect(crumbCookie(secondRender)).toBeUndefined();
  });

  test("accepts a search submitted from a page rendered before another page loaded", async () => {
    const tabA = await renderPage();
    const crumbShownInTabA = crumbValue(tabA);
    const tabB = await renderPage(crumbShownInTabA);

    const res = await submitSearch({
      formCrumb: crumbShownInTabA,
      cookie: crumbValue(tabB) ?? crumbShownInTabA,
    });

    expect(res.statusCode).toBe(StatusCodes.OK);
  });

  test("rejects a search submitted with a crumb that does not match the cookie", async () => {
    const render = await renderPage();

    const res = await submitSearch({
      formCrumb: "not-the-crumb-issued-for-this-session",
      cookie: crumbValue(render),
    });

    expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
  });
});
