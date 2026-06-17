import { getMsalLoggingSetup, getAuthenticationUrl, init } from "../../../app/auth/azure-auth.js";
import { getLogger } from "../../../app/logging/logger.js";
import { ConfidentialClientApplication, LogLevel, ResponseMode } from "@azure/msal-node";

jest.mock("../../../app/logging/logger.js");
jest.mock("@azure/msal-node", () => {
  const actual = jest.requireActual("@azure/msal-node");
  return {
    ...actual,
    ConfidentialClientApplication: jest.fn(),
  };
});

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe("Azure auth test", () => {
  beforeAll(() => {
    process.env.NODE_ENV = "production";
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
});
