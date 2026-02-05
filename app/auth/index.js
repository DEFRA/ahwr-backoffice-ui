import * as devAuth from "../auth/dev-auth.js";
import * as realAuth from "../auth/azure-auth.js";
import { config } from "../config/index.js";
import { mapAuth } from "./map-auth.js";
import { getLogger } from "../logging/logger.js";

const PERF_TEST_MODE_KEY = "perf-test-mode";
let cachedToggleAuthMode = null;

const getAuth = async () => {
  if (config.perfTestEnabled) {
    const toggledMode = await cachedToggleAuthMode.get(PERF_TEST_MODE_KEY);
    if (toggledMode) {
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
    segment: PERF_TEST_MODE_KEY,
    expiresIn: config.cache.expiresIn,
  });
};

const toggleAuthMode = async (possibleUserId) => {
  if (config.perfTestEnabled && possibleUserId) {
    if (possibleUserId.toLowerCase().startsWith("perfteston")) {
      getLogger().info("Enabling perf test auth mode");
      await cachedToggleAuthMode.set(PERF_TEST_MODE_KEY, true);
    } else if (possibleUserId.toLowerCase().startsWith("perftestoff")) {
      getLogger().info("Disabling perf test auth mode");
      await cachedToggleAuthMode.set(PERF_TEST_MODE_KEY, false);
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
