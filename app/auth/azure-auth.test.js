import {
  getMsalLoggingSetup,
  getAuthenticationUrl,
  init,
  authenticate,
  logout,
} from "./azure-auth.js";
import { getLogger } from "../logging/logger.js";
import { ConfidentialClientApplication, LogLevel, ResponseMode } from "@azure/msal-node";
import { config } from "../config/index.js";
import { WebIdentityTokenProvider } from "@defra/hapi-auth-oidc";

jest.mock("../logging/logger.js");
jest.mock("@azure/msal-node", () => {
  const actual = jest.requireActual("@azure/msal-node");
  return {
    ...actual,
    ConfidentialClientApplication: jest.fn(),
  };
});
jest.mock("@defra/hapi-auth-oidc", () => ({
  WebIdentityTokenProvider: jest.fn(),
}));
jest.mock("../config/index.js", () => {
  const { asConvict } = require("../../test/helpers/mock-config.js");
  const values = jest.requireActual("../config/index.js").config.getProperties();
  values.auth = {
    ...values.auth,
    clientId: "test-client-id",
    authority: "https://test-authority",
    redirectUrl: "https://test-redirect",
  };
  values.isProd = true;
  values.isTest = false;
  return { config: asConvict(values) };
});

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe("Azure auth test", () => {
  const mockGetCredentials = jest.fn();

  beforeAll(() => {
    process.env.NODE_ENV = "production";
  });

  beforeEach(() => {
    getLogger.mockReturnValue(mockLogger);
    WebIdentityTokenProvider.mockImplementation(() => ({ getCredentials: mockGetCredentials }));
    ConfidentialClientApplication.mockImplementation(() => ({}));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("error message from msal-node is output to error logger", () => {
    getLogger.mockImplementationOnce(() => mockLogger);
    getMsalLoggingSetup().loggerCallback(LogLevel.Error, "test message");
    expect(mockLogger.error).toHaveBeenCalledWith("test message");
  });

  test("warning message from msal-node is output to warn logger", () => {
    getLogger.mockImplementationOnce(() => mockLogger);
    getMsalLoggingSetup().loggerCallback(LogLevel.Warning, "test message");
    expect(mockLogger.warn).toHaveBeenCalledWith("test message");
  });

  test("info message from msal-node is output to error logger", () => {
    getLogger.mockImplementationOnce(() => mockLogger);
    getMsalLoggingSetup().loggerCallback(LogLevel.Info, "test message");
    expect(mockLogger.info).toHaveBeenCalledWith("test message");
  });

  test("getAuthenticationUrl requests form_post response mode", async () => {
    const getAuthCodeUrl = jest.fn().mockResolvedValue("https://login.microsoftonline.com/auth");
    ConfidentialClientApplication.mockImplementation(() => ({ getAuthCodeUrl }));
    init();

    await getAuthenticationUrl();

    expect(getAuthCodeUrl).toHaveBeenCalledWith(
      expect.objectContaining({ responseMode: ResponseMode.FORM_POST }),
    );
  });

  test("the msal application is built with no client secret", () => {
    init();

    const { auth } = ConfidentialClientApplication.mock.calls[0][0];

    expect(auth).not.toHaveProperty("clientSecret");
  });

  test("clientAssertion retrieves and returns credentials from the auth provider", async () => {
    const expectedAssertion = "test-assertion-token";
    mockGetCredentials.mockResolvedValue(expectedAssertion);

    init();

    expect(ConfidentialClientApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        auth: expect.objectContaining({
          clientId: config.get("auth.clientId"),
          authority: config.get("auth.authority"),
          clientAssertion: expect.any(Function),
        }),
      }),
    );
    expect(WebIdentityTokenProvider).toHaveBeenCalledWith({ audience: ["ahwr-backoffice-ui"] });

    const { auth } = ConfidentialClientApplication.mock.calls[0][0];
    const assertion = await auth.clientAssertion();

    expect(mockGetCredentials).toHaveBeenCalled();
    expect(assertion).toBe(expectedAssertion);
  });

  describe("wrapped logger passed to getCredentials", () => {
    let wrappedLogger;

    beforeEach(async () => {
      mockGetCredentials.mockResolvedValue("token");
      init();
      const { auth } = ConfidentialClientApplication.mock.calls[0][0];
      await auth.clientAssertion();
      wrappedLogger = mockGetCredentials.mock.calls[0][0];
    });

    test("does not pass the raw logger directly", () => {
      expect(wrappedLogger).not.toBe(mockLogger);
    });

    test("passes info calls through to the underlying logger", () => {
      wrappedLogger.info("test info");
      expect(mockLogger.info).toHaveBeenCalledWith("test info");
    });

    test("passes warn calls through to the underlying logger", () => {
      wrappedLogger.warn("test warning");
      expect(mockLogger.warn).toHaveBeenCalledWith("test warning");
    });

    test("reorders (string, Error) error calls to pino format ({ error }, string)", () => {
      const err = new Error("something failed");
      wrappedLogger.error("refresh failed", err);
      expect(mockLogger.error).toHaveBeenCalledWith({ error: err }, "refresh failed");
    });

    test("passes through error calls that are not (string, Error) unchanged", () => {
      wrappedLogger.error("plain error message");
      expect(mockLogger.error).toHaveBeenCalledWith("plain error message", undefined);
    });
  });

  test("getMsalLoggingSetup returns no logging config outside prod and test", () => {
    config.set("isProd", false);
    config.set("isTest", false);

    expect(getMsalLoggingSetup()).toEqual({});

    config.set("isProd", true);
    config.set("isTest", false);
  });

  describe("authenticate", () => {
    it("acquires a token, creates a session and returns username and roles", async () => {
      const acquireTokenByCode = jest.fn().mockResolvedValue({
        account: { username: "user@test" },
        idTokenClaims: { roles: ["administrator"] },
      });
      ConfidentialClientApplication.mockImplementation(() => ({ acquireTokenByCode }));
      init();

      const auth = { createSession: jest.fn().mockResolvedValue("session-id") };
      const cookieAuth = { set: jest.fn() };

      const result = await authenticate("redirect-code", auth, cookieAuth);

      expect(acquireTokenByCode).toHaveBeenCalledWith({
        code: "redirect-code",
        redirectUri: config.get("auth.redirectUrl"),
      });
      expect(auth.createSession).toHaveBeenCalledWith({ username: "user@test" }, ["administrator"]);
      expect(cookieAuth.set).toHaveBeenCalledWith({ id: "session-id" });
      expect(result).toEqual(["user@test", ["administrator"]]);
    });
  });

  describe("logout", () => {
    it("removes the account from the token cache", async () => {
      const removeAccount = jest.fn().mockResolvedValue(undefined);
      ConfidentialClientApplication.mockImplementation(() => ({
        getTokenCache: () => ({ removeAccount }),
      }));
      init();

      const account = { username: "user@test" };
      await logout(account);

      expect(removeAccount).toHaveBeenCalledWith(account);
    });

    it("logs when the account cannot be removed", async () => {
      const error = new Error("cache failure");
      ConfidentialClientApplication.mockImplementation(() => ({
        getTokenCache: () => ({ removeAccount: jest.fn().mockRejectedValue(error) }),
      }));
      init();

      await logout({ username: "user@test" });

      expect(mockLogger.error).toHaveBeenCalledWith({ error }, "Unable to end session");
    });
  });
});
