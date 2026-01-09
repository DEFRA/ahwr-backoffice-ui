import { StatusCodes } from "http-status-codes";
import { permissions } from "../../../../app/auth/permissions";
import { createServer } from "../../../../app/server";
import { auth } from "../../../../app/auth";

const { administrator } = permissions;

jest.mock("../../../../app/auth/index.js", () => ({
  auth: {
    logout: jest.fn(),
  },
}));

describe("Logout route test", () => {
  const authentication = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: "user123" },
  };

  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  test("logs the user out and redirects to login", async () => {
    const options = {
      method: "GET",
      url: "/logout",
      auth: authentication,
    };
    const res = await server.inject(options);

    expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    expect(res.headers.location).toBe("/login");
    expect(auth.logout).toHaveBeenCalledWith(authentication.credentials.account);
  });
});
