import { StatusCodes } from "http-status-codes";
import { createServer } from "../../../../app/server";
import { auth } from "../../../../app/auth";

jest.mock("../../../../app/auth/index.js", () => ({
  auth: {
    getAuthenticationUrl: jest.fn().mockResolvedValue("/test123"),
  },
}));

describe("Login route test", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  test("logs the user out and redirects to login", async () => {
    const options = {
      method: "GET",
      url: "/login",
    };
    const res = await server.inject(options);

    expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    expect(auth.getAuthenticationUrl).toHaveBeenCalledWith(undefined);
    expect(res.headers.location).toBe("/test123");
  });

  test("passes the userId to getAuthenticationUrl if provided", async () => {
    const options = {
      method: "GET",
      url: "/login?userId=ZZZ",
    };
    const res = await server.inject(options);

    expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    expect(auth.getAuthenticationUrl).toHaveBeenCalledWith("ZZZ");
    expect(res.headers.location).toBe("/test123");
  });
});
