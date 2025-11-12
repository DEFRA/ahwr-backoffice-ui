import { config } from "../config/index.js";
import { ConfidentialClientApplication, LogLevel } from "@azure/msal-node";

const msalLogging = config.isProd
  ? {
      loggerCallback(_loglevel, message, _containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Verbose,
    }
  : {};

let msalApplication;

export const init = () => {
  msalApplication = new ConfidentialClientApplication({
    auth: config.auth,
    system: { loggerOptions: msalLogging, customAgentOptions: { keepAlive: false } },
  });
};

export const getAuthenticationUrl = () => {
  const authCodeUrlParameters = {
    prompt: "select_account", // Force the MS account select dialog
    redirectUri: config.auth.redirectUrl,
  };

  return msalApplication.getAuthCodeUrl(authCodeUrlParameters);
};

export const authenticate = async (redirectCode, auth, cookieAuth) => {
  const token = await msalApplication.acquireTokenByCode({
    code: redirectCode,
    redirectUri: config.auth.redirectUrl,
  });

  const sessionId = await auth.createSession(token.account, token.idTokenClaims.roles);
  cookieAuth.set({ id: sessionId });

  return [token.account.username, token.idTokenClaims.roles];
};

export const refresh = async (account, cookieAuth) => {
  const token = await msalApplication.acquireTokenSilent({
    account,
    forceRefresh: true,
  });

  cookieAuth.set({
    scope: token.idTokenClaims.roles,
    account: token.account,
  });

  return token.idTokenClaims.roles;
};

export const logout = async (account) => {
  try {
    await msalApplication.getTokenCache().removeAccount(account);
  } catch (err) {
    console.error("Unable to end session", err);
  }
};
