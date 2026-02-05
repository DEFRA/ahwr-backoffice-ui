import { config } from "../../../app/config/index.js";
import { auth as authIndex } from "../../../app/auth/index.js";
import { init } from "../../../app/auth/azure-auth.js";
import * as realAuth from "../../../app/auth/azure-auth.js";
import * as devAuth from "../../../app/auth/dev-auth.js";
import { getLogger } from "../../../app/logging/logger.js";

jest.mock("../../../app/auth/azure-auth.js");
jest.mock("../../../app/auth/dev-auth.js");
jest.mock("../../../app/logging/logger.js");

const mockGet = jest.fn();
const mockSet = jest.fn();
const mockServer = {
  cache: jest.fn().mockReturnValue({
    get: mockGet,
    set: mockSet,
  }),
};

describe("auth index", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("initAuth", () => {
    it("calls realAuth.init when auth is enabled", async () => {
      config.auth.enabled = true;
      authIndex.initAuth(mockServer);
      expect(init).toHaveBeenCalled();
    });
    it("does not call realAuth.init when auth is not enabled", async () => {
      config.auth.enabled = false;
      authIndex.initAuth(mockServer);
      expect(init).not.toHaveBeenCalled();
    });
  });

  describe("authenticate", () => {
    beforeEach(() => {
      authIndex.initAuth(mockServer);
      config.perfTestEnabled = false;
    });
    it("when auth is enabled calls realAuth authenticate", async () => {
      config.auth.enabled = true;
      const mockAuth = {};
      const mockCookieAuth = {};
      await authIndex.authenticate("code", mockAuth, mockCookieAuth);
      expect(realAuth.authenticate).toHaveBeenCalledWith("code", mockAuth, mockCookieAuth);
      expect(devAuth.authenticate).not.toHaveBeenCalled();
    });
    it("when auth is disabled calls devAuth authenticate", async () => {
      config.auth.enabled = false;
      const mockAuth = {};
      const mockCookieAuth = {};
      await authIndex.authenticate("code", mockAuth, mockCookieAuth);
      expect(devAuth.authenticate).toHaveBeenCalledWith("code", mockAuth, mockCookieAuth);
      expect(realAuth.authenticate).not.toHaveBeenCalled();
    });
  });

  describe("getAuthenticationUrl", () => {
    beforeEach(() => {
      authIndex.initAuth(mockServer);
      config.perfTestEnabled = false;
    });
    it("when auth is enabled calls realAuth getAuthenticationUrl", async () => {
      config.auth.enabled = true;
      await authIndex.getAuthenticationUrl();
      expect(realAuth.getAuthenticationUrl).toHaveBeenCalled();
      expect(devAuth.getAuthenticationUrl).not.toHaveBeenCalled();
    });
    it("when auth is disabled calls devAuth getAuthenticationUrl", async () => {
      config.auth.enabled = false;
      const userId = "test-user";
      await authIndex.getAuthenticationUrl(userId);
      expect(devAuth.getAuthenticationUrl).toHaveBeenCalledWith(userId);
      expect(realAuth.getAuthenticationUrl).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    beforeEach(() => {
      authIndex.initAuth(mockServer);
      config.perfTestEnabled = false;
    });
    it("when auth is enabled calls realAuth logout", async () => {
      config.auth.enabled = true;
      const mockAccount = {};
      await authIndex.logout(mockAccount);
      expect(realAuth.logout).toHaveBeenCalledWith(mockAccount);
      expect(devAuth.logout).not.toHaveBeenCalled();
    });
    it("when auth is disabled calls devAuth logout", async () => {
      config.auth.enabled = false;
      const mockAccount = {};
      await authIndex.logout(mockAccount);
      expect(devAuth.logout).toHaveBeenCalledWith(mockAccount);
      expect(realAuth.logout).not.toHaveBeenCalled();
    });
  });

  describe("toggleAuthMode", () => {
    const mockLogger = {
      info: jest.fn(),
    };

    beforeEach(() => {
      getLogger.mockReturnValue(mockLogger);
      config.auth.enabled = true;
      authIndex.initAuth(mockServer);
    });
    it('enables perf test auth mode when userId starts with "perfteston"', async () => {
      config.perfTestEnabled = true;
      mockGet.mockReturnValueOnce(true);

      await authIndex.getAuthenticationUrl("perfteston123");
      expect(mockLogger.info).toHaveBeenCalledWith("Enabling perf test auth mode");
      expect(mockSet).toHaveBeenCalledWith("perf-test-mode", true);
      // after toggle on, should call through to dev auth method
      expect(devAuth.getAuthenticationUrl).toHaveBeenCalled();
      expect(realAuth.getAuthenticationUrl).not.toHaveBeenCalled();
    });
    it('disables perf test auth mode when userId starts with "perftestoff"', async () => {
      config.perfTestEnabled = true;
      mockGet.mockReturnValueOnce(false);

      await authIndex.getAuthenticationUrl("perftestoff123");
      expect(mockLogger.info).toHaveBeenCalledWith("Disabling perf test auth mode");
      expect(mockSet).toHaveBeenCalledWith("perf-test-mode", false);
      // after toggle off, should call through to real auth method
      expect(realAuth.getAuthenticationUrl).toHaveBeenCalled();
      expect(devAuth.getAuthenticationUrl).not.toHaveBeenCalled();
    });
    it("does not change perf test auth mode when userId does not start with perf test strings", async () => {
      config.perfTestEnabled = true;
      mockGet.mockReturnValue(true);
      await authIndex.getAuthenticationUrl("perfteston123");

      await authIndex.getAuthenticationUrl("regularuser");
      // just called once on initial switch
      expect(mockLogger.info).toHaveBeenCalledTimes(1);
      expect(mockSet).toHaveBeenCalledTimes(1);
      // but both calls go through to dev auth as mode remains on
      expect(devAuth.getAuthenticationUrl).toHaveBeenCalledTimes(2);
    });
  });
});
