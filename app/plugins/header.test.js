import { createServer } from "../server.js";
import { config } from "../config/index.js";

let server;

beforeAll(async () => {
  server = await createServer();
});

const getHeaders = async (url = "/accessibility") => {
  const { headers } = await server.inject({
    method: "GET",
    url,
  });

  return headers;
};

describe("security headers", () => {
  test.each([
    ["x-frame-options", "deny"],
    ["x-content-type-options", "nosniff"],
    ["access-control-allow-origin", config.serviceUri],
    ["cross-origin-opener-policy", "same-origin"],
    ["cross-origin-embedder-policy", "require-corp"],
    ["x-robots-tag", "noindex, nofollow"],
    ["strict-transport-security", "max-age=31536000;"],
    ["cache-control", "no-store"],
    ["referrer-policy", "no-referrer"],
  ])("sets %s to the expected value", async (header, value) => {
    const headers = await getHeaders();

    expect(headers[header]).toBe(value);
  });

  test("skips the headers when the response has no header element", async () => {
    const { headers } = await server.inject({
      method: "POST",
      url: "/nonsense",
    });

    expect(headers["x-frame-options"]).toBeUndefined();
  });
});
