import { config } from "../config/index.js";
import { ConfidentialClientApplication, LogLevel, ResponseMode } from "@azure/msal-node";
import { getLogger } from "../logging/logger.js";
import { WebIdentityTokenProvider } from "@defra/hapi-auth-oidc";

const wrapLoggerForPino = (logger) => ({
  info: (...args) => logger.info(...args),
  warn: (...args) => logger.warn(...args),
  error: (firstArg, secondArg) => {
    if (typeof firstArg === "string" && secondArg instanceof Error) {
      logger.error(
        {
          error: {
            type: secondArg.constructor?.name ?? secondArg.name,
            message: secondArg.message,
            stack_trace: secondArg.stack,
          },
        },
        firstArg,
      );
    } else {
      logger.error(firstArg, secondArg);
    }
  },
});

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
  let auth;

  if (config.federatedCredentials.enabled) {
    const logger = getLogger();

    logger.info("Initialising auth provider");
    const authProvider = new WebIdentityTokenProvider({ audience: "ahwr-backoffice-ui" });
    logger.info("Initialised auth provider");

    auth = {
      clientId: config.auth.clientId,
      authority: config.auth.authority,
      clientAssertion: async () => {
        logger.info("Retrieving credentials");
        const assertion = await authProvider.getCredentials(wrapLoggerForPino(logger));
        logger.info(`Retrieved credentials: ${assertion.slice(0, 4)}`);
        return assertion;
      },
    };
  } else {
    auth = config.auth;
  }

  msalApplication = new ConfidentialClientApplication({
    auth,
    system: { loggerOptions: msalLogging, customAgentOptions: { keepAlive: false } },
  });
};

export const getAuthenticationUrl = () => {
  const authCodeUrlParameters = {
    prompt: "select_account", // Force the MS account select dialog
    redirectUri: config.auth.redirectUrl,
    responseMode: ResponseMode.FORM_POST,
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
