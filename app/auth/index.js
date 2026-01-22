import * as devAuth from "../auth/dev-auth.js";
import * as realAuth from "../auth/azure-auth.js";
import { config } from "../config/index.js";
import { mapAuth } from "./map-auth.js";
import { getLogger } from '../logging/logger.js'

let perfTestAuthMode = false;

const getAuth = () => {
  if(config.perfTestEnabled && perfTestAuthMode) {
    return devAuth;
  } else if (config.auth.enabled) {
    return realAuth;
  } else {
    return devAuth;
  }
};

const initAuth = () => {
  if (config.auth.enabled) {
    realAuth.init();
  }
}

const toggleAuthMode = (possibleUserId) => {
  if(config.perfTestEnabled && possibleUserId) {
    if(possibleUserId.toLowerCase().startsWith("perfteston")) {
      getLogger().info("Enabling perf test auth mode");
      perfTestAuthMode = true;
    } else if (possibleUserId.toLowerCase().startsWith("perftestoff")) {
      getLogger().info("Disabling perf test auth mode");
      perfTestAuthMode = false;
    }
  }
}

const authenticate = async (redirectCode, auth, cookieAuth) => {
  return getAuth().authenticate(redirectCode, auth, cookieAuth);
}

const logout = async (account) => {
  return getAuth().logout(account);
}

const getAuthenticationUrl = (userId) => {
  toggleAuthMode(userId);
  return getAuth().getAuthenticationUrl(userId);
}

export const auth = {
  authenticate,
  getAuthenticationUrl,
  initAuth,
  logout,
  mapAuth,
};
