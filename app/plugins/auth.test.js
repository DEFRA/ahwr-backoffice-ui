import Hapi from "@hapi/hapi";
import { StatusCodes } from "http-status-codes";
import { authPlugin } from "./auth.js";
import { getCacheEngine } from "../cache/get-cache-engine.js";

const account = { name: "Tester", username: "tester@test" };
const scope = ["administrator"];

const cookieFrom = (response) => response.headers["set-cookie"][0].split(";")[0];

const buildServer = async () => {
  const server = Hapi.server({ cache: [getCacheEngine()] });
  await server.register(authPlugin);

  server.route({
    method: "GET",
    path: "/login",
    options: { auth: false },
    handler: async (request, h) => {
      const sessionId = await server.plugins.auth.createSession(account, scope);
      request.cookieAuth.set({ id: sessionId });
      return h.response({ ok: true });
    },
  });

  server.route({
    method: "GET",
    path: "/login-orphaned-session",
    options: { auth: false },
    handler: (request, h) => {
      request.cookieAuth.set({ id: "session-not-in-cache" });
      return h.response({ ok: true });
    },
  });

  server.route({
    method: "GET",
    path: "/protected",
    handler: (request) => request.auth.credentials,
  });

  await server.initialize();
  return server;
};

describe("auth plugin session validation", () => {
  let server;

  beforeAll(async () => {
    server = await buildServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  test("grants access when the session is in the cache and exposes account and scope as credentials", async () => {
    const login = await server.inject({ method: "GET", url: "/login" });

    const response = await server.inject({
      method: "GET",
      url: "/protected",
      headers: { cookie: cookieFrom(login) },
    });

    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(JSON.parse(response.payload)).toEqual({ account, scope });
  });

  test("redirects to the login page when the session is no longer in the cache", async () => {
    const login = await server.inject({ method: "GET", url: "/login-orphaned-session" });

    const response = await server.inject({
      method: "GET",
      url: "/protected",
      headers: { cookie: cookieFrom(login) },
    });

    expect(response.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    expect(response.headers.location).toBe("/login");
  });
});
