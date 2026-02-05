import * as devAuth from "../auth/dev-auth.js";
import * as realAuth from "../auth/azure-auth.js";
import { config } from "../config/index.js";
import { mapAuth } from "./map-auth.js";
import { getLogger } from "../logging/logger.js";

let cachedToggleAuthMode = null;

const getAuth = async () => {
  if (config.perfTestEnabled) {
    const toggledMode = await cachedToggleAuthMode.get("perf-test-mode");
    if (toggledMode) {
      console.log("Perf test mode enabled");
      return devAuth;
    } else {
      return realAuth;
    }
  }

  if (config.auth.enabled) {
    return realAuth;
  } else {
    return devAuth;
  }
};

const initAuth = (server) => {
  if (config.auth.enabled) {
    realAuth.init();
  }
  cachedToggleAuthMode = server.cache({
    cache: config.cache.name,
    segment: "perf-test-mode",
    expiresIn: config.cache.expiresIn,
  });
};

const toggleAuthMode = async (possibleUserId) => {
  if (config.perfTestEnabled && possibleUserId) {
    if (possibleUserId.toLowerCase().startsWith("perfteston")) {
      getLogger().info("Enabling perf test auth mode");
      await cachedToggleAuthMode.set("perf-test-mode", true);
    } else if (possibleUserId.toLowerCase().startsWith("perftestoff")) {
      getLogger().info("Disabling perf test auth mode");
      await cachedToggleAuthMode.set("perf-test-mode", false);
    }
  }
};

const authenticate = async (redirectCode, authPlugin, cookieAuth) => {
  return (await getAuth()).authenticate(redirectCode, authPlugin, cookieAuth);
};

const logout = async (account) => {
  return (await getAuth()).logout(account);
};

const getAuthenticationUrl = async (userId) => {
  await toggleAuthMode(userId);
  return (await getAuth()).getAuthenticationUrl(userId);
};

export const auth = {
  authenticate,
  getAuthenticationUrl,
  initAuth,
  logout,
  mapAuth,
};
