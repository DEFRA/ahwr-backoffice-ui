import { config } from "../config/index.js";
import { auth as authIndex } from "./index.js";
import { init } from "./azure-auth.js";
import * as realAuth from "./azure-auth.js";
import * as devAuth from "./dev-auth.js";

jest.mock("./azure-auth.js");
jest.mock("./dev-auth.js");
jest.mock("../logging/logger.js");

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
      config.set("auth.enabled", true);
      authIndex.initAuth();
      expect(init).toHaveBeenCalled();
    });
    it("does not call realAuth.init when auth is not enabled", async () => {
      config.set("auth.enabled", false);
      authIndex.initAuth();
      expect(init).not.toHaveBeenCalled();
    });
  });

  describe("authenticate", () => {
    beforeEach(() => {
      authIndex.initAuth();
      config.set("perfTestEnabled", false);
    });
    it("when auth is enabled calls realAuth authenticate", async () => {
      config.set("auth.enabled", true);
      const mockAuth = {};
      const mockCookieAuth = {};
      await authIndex.authenticate("code", mockAuth, mockCookieAuth);
      expect(realAuth.authenticate).toHaveBeenCalledWith("code", mockAuth, mockCookieAuth);
      expect(devAuth.authenticate).not.toHaveBeenCalled();
    });
    it("when auth is disabled calls devAuth authenticate", async () => {
      config.set("auth.enabled", false);
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
      config.set("perfTestEnabled", false);
    });
    it("when auth is enabled calls realAuth getAuthenticationUrl", async () => {
      config.set("auth.enabled", true);
      await authIndex.getAuthenticationUrl();
      expect(realAuth.getAuthenticationUrl).toHaveBeenCalled();
      expect(devAuth.getAuthenticationUrl).not.toHaveBeenCalled();
    });
    it("when auth is disabled calls devAuth getAuthenticationUrl", async () => {
      config.set("auth.enabled", false);
      const userId = "test-user";
      await authIndex.getAuthenticationUrl(userId);
      expect(devAuth.getAuthenticationUrl).toHaveBeenCalledWith(userId);
      expect(realAuth.getAuthenticationUrl).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    beforeEach(() => {
      authIndex.initAuth();
      config.set("perfTestEnabled", false);
    });
    it("when auth is enabled calls realAuth logout", async () => {
      config.set("auth.enabled", true);
      const mockAccount = {};
      await authIndex.logout(mockAccount);
      expect(realAuth.logout).toHaveBeenCalledWith(mockAccount);
      expect(devAuth.logout).not.toHaveBeenCalled();
    });
    it("when auth is disabled calls devAuth logout", async () => {
      config.set("auth.enabled", false);
      const mockAccount = {};
      await authIndex.logout(mockAccount);
      expect(devAuth.logout).toHaveBeenCalledWith(mockAccount);
      expect(realAuth.logout).not.toHaveBeenCalled();
    });
  });
});
