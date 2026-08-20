import { config } from "../config/index.js";
import { ConfidentialClientApplication, LogLevel, ResponseMode } from "@azure/msal-node";
import { getLogger } from "../logging/logger.js";
import { WebIdentityTokenProvider } from "@defra/hapi-auth-oidc";

const wrapLoggerForPino = (logger) => ({
  info: (...args) => logger.info(...args),
  warn: (...args) => logger.warn(...args),
  // WebIdentityTokenProvider calls error(message, Error) but pino expects error({ err }, message)
  error: (msg, err) =>
    err instanceof Error ? logger.error({ error: err }, msg) : logger.error(msg, err),
});

export const getMsalLoggingSetup = () => {
  if (config.get("isProd") || config.get("isTest")) {
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
  // Bug in library where audience should be an array but expected type is string
  const authProvider = new WebIdentityTokenProvider({ audience: ["ahwr-backoffice-ui"] });

  msalApplication = new ConfidentialClientApplication({
    auth: {
      clientId: config.get("auth.clientId"),
      authority: config.get("auth.authority"),
      clientAssertion: async () => authProvider.getCredentials(wrapLoggerForPino(getLogger())),
    },
    system: { loggerOptions: msalLogging, customAgentOptions: { keepAlive: false } },
  });
};

export const getAuthenticationUrl = () => {
  const authCodeUrlParameters = {
    prompt: "select_account", // Force the MS account select dialog
    redirectUri: config.get("auth.redirectUrl"),
    responseMode: ResponseMode.FORM_POST,
  };

  return msalApplication.getAuthCodeUrl(authCodeUrlParameters);
};

export const authenticate = async (redirectCode, auth, cookieAuth) => {
  const token = await msalApplication.acquireTokenByCode({
    code: redirectCode,
    redirectUri: config.get("auth.redirectUrl"),
  });

  const sessionId = await auth.createSession(token.account, token.idTokenClaims.roles);
  cookieAuth.set({ id: sessionId });

  return [token.account.username, token.idTokenClaims.roles];
};

export const logout = async (account) => {
  try {
    await msalApplication.getTokenCache().removeAccount(account);
  } catch (error) {
    getLogger().error({ error }, "Unable to end session");
  }
};
