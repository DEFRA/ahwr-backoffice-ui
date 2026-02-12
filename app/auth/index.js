import * as devAuth from "../auth/dev-auth.js";
import * as realAuth from "../auth/azure-auth.js";
import { config } from "../config/index.js";
import { mapAuth } from "./map-auth.js";

const getAuth = async () => {
  if (config.auth.enabled) {
    return realAuth;
  } else {
    return devAuth;
  }
};

const initAuth = () => {
  if (config.auth.enabled) {
    realAuth.init();
  }
};

const authenticate = async (redirectCode, authPlugin, cookieAuth) => {
  return (await getAuth()).authenticate(redirectCode, authPlugin, cookieAuth);
};

const logout = async (account) => {
  return (await getAuth()).logout(account);
};

const getAuthenticationUrl = async (userId) => {
  return (await getAuth()).getAuthenticationUrl(userId);
};

export const auth = {
  authenticate,
  getAuthenticationUrl,
  initAuth,
  logout,
  mapAuth,
};
