import * as cheerio from "cheerio";
import { createServer } from "../server.js";
import { parseCspDirectives } from "../../test/helpers/parse-csp-directives.js";

let server;

beforeAll(async () => {
  server = await createServer();
});

const getResponseHeaders = async () => {
  const { headers } = await server.inject({
    method: "GET",
    url: "/accessibility",
  });

  return headers;
};

const getCspDirectives = async () =>
  parseCspDirectives((await getResponseHeaders())["content-security-policy"]);

const getScriptNonce = (directives) =>
  directives["script-src"].find((source) => source.startsWith("'nonce-"));

describe("content security policy directives", () => {
  let directives;

  beforeAll(async () => {
    directives = await getCspDirectives();
  });

  test("restricts default-src to self", () => {
    expect(directives["default-src"]).toEqual(["'self'"]);
  });

  test("blocks plugin content via object-src none", () => {
    expect(directives["object-src"]).toEqual(["'none'"]);
  });

  test("prevents clickjacking via frame-ancestors none", () => {
    expect(directives["frame-ancestors"]).toEqual(["'none'"]);
  });

  test("restricts form-action to self", () => {
    expect(directives["form-action"]).toEqual(["'self'"]);
  });

  test("restricts base-uri to self", () => {
    expect(directives["base-uri"]).toEqual(["'self'"]);
  });

  test("restricts connect-src to self", () => {
    expect(directives["connect-src"]).toEqual(["'self'"]);
  });

  test("restricts style-src to self", () => {
    expect(directives["style-src"]).toEqual(["'self'"]);
  });

  test("restricts img-src to self", () => {
    expect(directives["img-src"]).toEqual(["'self'"]);
  });

  test("contains no third-party host in any directive", () => {
    const allSources = Object.values(directives).flat();
    const allowedPrefixes = ["'self'", "'none'", "'nonce-"];

    allSources.forEach((source) => {
      expect(allowedPrefixes.some((allowed) => source.startsWith(allowed))).toBe(true);
    });
  });
});

describe("script-src", () => {
  let directives;

  beforeAll(async () => {
    directives = await getCspDirectives();
  });

  test("allows self", () => {
    expect(directives["script-src"]).toEqual(expect.arrayContaining(["'self'"]));
  });

  test("carries a per-request nonce", () => {
    expect(getScriptNonce(directives)).toBeDefined();
  });

  test("omits unsafe-inline and unsafe-eval", () => {
    expect(directives["script-src"]).not.toContain("'unsafe-inline'");
    expect(directives["script-src"]).not.toContain("'unsafe-eval'");
  });
});

describe("nonce and report-only behaviour", () => {
  test("does not emit a Content-Security-Policy-Report-Only header", async () => {
    const headers = await getResponseHeaders();

    expect(headers["content-security-policy-report-only"]).toBeUndefined();
  });

  test("generates a different nonce for each request", async () => {
    const firstNonce = getScriptNonce(await getCspDirectives());
    const secondNonce = getScriptNonce(await getCspDirectives());

    expect(firstNonce).toBeDefined();
    expect(secondNonce).toBeDefined();
    expect(firstNonce).not.toBe(secondNonce);
  });
});

describe("nonced inline script in rendered markup", () => {
  test("the GOV.UK Frontend js-enabled snippet nonce matches the header nonce", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/accessibility",
    });

    const directives = parseCspDirectives(response.headers["content-security-policy"]);
    const headerNonce = getScriptNonce(directives)?.replace(/^'nonce-|'$/g, "");

    const $ = cheerio.load(response.payload);
    const markupNonce = $("script[nonce]").first().attr("nonce");

    expect(headerNonce).toBeDefined();
    expect(markupNonce).toBeDefined();
    expect(markupNonce).toBe(headerNonce);
  });

  test("support.njk contains no inline script", async () => {
    const authResponse = await server.inject({
      method: "GET",
      url: "/support",
      auth: {
        strategy: "session-auth",
        credentials: {
          scope: ["Support"],
          account: { username: "test user" },
        },
      },
    });

    const $ = cheerio.load(authResponse.payload);
    const inlineScripts = $("script")
      .toArray()
      .filter((el) => !$(el).attr("src") && !$(el).attr("nonce"));

    expect(inlineScripts).toHaveLength(0);
  });
});
