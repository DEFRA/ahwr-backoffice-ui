import { config } from "../config/index.js";
import { ConfidentialClientApplication, LogLevel } from "@azure/msal-node";
import { getLogger } from "../logging/logger.js";

export const getMsalLoggingSetup = () => {
  if (config.isProd || config.isTest) {
    return {
      loggerCallback(loglevel, message, _containsPii) {
        const logger = getLogger();
        if (loglevel === LogLevel.Error) {
          logger.error(message);
        } else if (loglevel === LogLevel.Warning) {
          logger.warn(message);
        } else {
          logger.info(message);
        }
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Info,
    };
  } else {
    return {};
  }
};

const msalLogging = getMsalLoggingSetup();

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

export const logout = async (account) => {
  try {
    await msalApplication.getTokenCache().removeAccount(account);
  } catch (err) {
    console.error("Unable to end session", err);
  }
};
