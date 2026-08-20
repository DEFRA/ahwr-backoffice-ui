import convict from "convict";
import { convictValidateUri } from "./convict/validate-uri.js";
import { convictValidateCookiePassword } from "./convict/validate-cookie-password.js";

convict.addFormat(convictValidateUri);
convict.addFormat(convictValidateCookiePassword);

const SECONDS_PER_HOUR = 3600;
const MILLISECONDS_PER_SECOND = 1000;
const HOURS_PER_HALF_DAY = 12;
const halfDayInMs = MILLISECONDS_PER_SECOND * SECONDS_PER_HOUR * HOURS_PER_HALF_DAY;

const isProduction = process.env.NODE_ENV === "production";

const config = convict({
  cache: {
    expiresIn: {
      doc: "Session cache TTL in milliseconds",
      format: Number,
      default: halfDayInMs,
    },
    name: {
      doc: "Cache segment name",
      format: String,
      default: "session",
    },
    options: {
      host: {
        doc: "Redis host",
        format: String,
        default: "redis-hostname.default",
        env: "REDIS_HOST",
      },
      keyPrefix: {
        doc: "Redis key prefix",
        format: String,
        default: "ahwr-backoffice-ui:",
        env: "REDIS_KEY_PREFIX",
      },
      username: {
        doc: "Redis username",
        format: String,
        nullable: true,
        default: null,
        env: "REDIS_USERNAME",
      },
      password: {
        doc: "Redis password",
        format: String,
        nullable: true,
        default: null,
        sensitive: true,
        env: "REDIS_PASSWORD",
      },
      useSingleInstanceCache: {
        doc: "Use a single Redis instance rather than a cluster",
        format: Boolean,
        default: !isProduction,
      },
      useTLS: {
        doc: "Connect to Redis over TLS",
        format: Boolean,
        default: isProduction,
      },
    },
  },
  apiKeys: {
    backofficeUiApiKey: {
      doc: "Api key for the backoffice ui",
      format: String,
      default: null,
      sensitive: true,
      env: "BACKOFFICE_UI_API_KEY",
    },
  },
  cookie: {
    cookieNameCookiePolicy: {
      doc: "Cookie policy cookie name",
      format: String,
      default: "ffc_ahwr_backoffice_cookie_policy",
    },
    cookieNameAuth: {
      doc: "Auth cookie name",
      format: String,
      default: "ffc_ahwr_backoffice_auth",
    },
    cookieNameSession: {
      doc: "Session cookie name",
      format: String,
      default: "ffc_ahwr_backoffice_session",
    },
    isSameSite: {
      doc: "SameSite cookie attribute",
      format: String,
      default: "Lax",
    },
    isSecure: {
      doc: "Set the Secure flag on cookies",
      format: Boolean,
      default: isProduction,
    },
    password: {
      doc: "Cookie encryption password (min 32 chars)",
      format: "cookie-password",
      default: null,
      sensitive: true,
      env: "COOKIE_PASSWORD",
    },
    ttl: {
      doc: "Session cookie TTL in milliseconds",
      format: Number,
      default: halfDayInMs,
    },
  },
  isProd: {
    doc: "Running in production",
    format: Boolean,
    default: isProduction,
  },
  isTest: {
    doc: "Running under test",
    format: Boolean,
    default: process.env.NODE_ENV === "test",
  },
  isMetricsEnabled: {
    doc: "Enable metrics reporting",
    format: Boolean,
    default: isProduction,
  },
  port: {
    doc: "The port to bind",
    format: Number,
    default: null,
    env: "PORT",
  },
  serviceUri: {
    doc: "Backoffice service URI",
    format: "uri",
    default: null,
    env: "AHWR_SERVICE_URI",
  },
  useRedis: {
    doc: "Use Redis for the session cache",
    format: Boolean,
    default: process.env.NODE_ENV !== "test",
  },
  applicationApiUri: {
    doc: "Application backend API URI",
    format: "uri",
    default: null,
    env: "AHWR_APPLICATION_BACKEND_URL",
  },
  paymentProxyApiUri: {
    doc: "Payment proxy API URI",
    format: "uri",
    default: null,
    env: "AHWR_PAYMENT_PROXY_URL",
  },
  messageGeneratorApiUri: {
    doc: "Message generator API URI",
    format: "uri",
    default: null,
    env: "AHWR_MESSAGE_GENERATOR_URL",
  },
  documentGeneratorApiUri: {
    doc: "Document generator API URI",
    format: "uri",
    default: null,
    env: "AHWR_DOCUMENT_GENERATOR_URL",
  },
  commsProxyApiUri: {
    doc: "Comms proxy API URI",
    format: "uri",
    default: null,
    env: "AHWR_COMMS_PROXY_URL",
  },
  displayPageSize: {
    doc: "Number of items to display per page",
    format: Number,
    default: 20,
    env: "DISPLAY_PAGE_SIZE",
  },
  superAdmins: {
    doc: "Super admin usernames",
    format: Array,
    default: process.env.SUPER_ADMINS
      ? process.env.SUPER_ADMINS.split(",").map((user) => user.trim().toLowerCase())
      : [],
  },
  serviceVersion: {
    doc: "Service version",
    format: String,
    default: null,
    env: "SERVICE_VERSION",
  },
  name: {
    doc: "Application name",
    format: String,
    default: "ahwr-backoffice-ui",
    env: "SERVICE_NAME",
  },
  logLevel: {
    doc: "Logging level",
    format: String,
    default: process.env.NODE_ENV === "test" ? "silent" : "info",
    env: "LOG_LEVEL",
  },
  logFormat: {
    doc: "Log output format",
    format: String,
    default: process.env.USE_PRETTY_PRINT === "true" ? "pino-pretty" : "ecs",
  },
  logRedact: {
    doc: "Log paths to redact",
    format: Array,
    default: process.env.LOG_REDACT
      ? process.env.LOG_REDACT.split(",")
      : ["req.headers", "res.headers"],
  },
  withdrawClaimEnabled: {
    doc: "Enable claim withdrawal",
    format: Boolean,
    default: process.env.WITHDRAW_CLAIM_ENABLED === "true",
  },
  perfTestEnabled: {
    doc: "Enable performance-test auth bypass",
    format: Boolean,
    default: process.env.PERF_TEST_ENABLED === "true",
  },
  auth: {
    enabled: {
      doc: "Enable Azure AD authentication",
      format: Boolean,
      default: process.env.AADAR_ENABLED === "true",
    },
    clientId: {
      doc: "Azure AD client id",
      format: String,
      default: null,
      env: "AADAR_CLIENT_ID",
    },
    authority: {
      doc: "Azure AD authority URL",
      format: "uri",
      default: null,
      env: "AADAR_AUTHORITY_URL",
    },
    redirectUrl: {
      doc: "Azure AD redirect URL",
      format: "uri",
      default: null,
      env: "AADAR_REDIRECT_URL",
    },
  },
});

if (process.env.NODE_ENV !== "test") {
  config.validate({ allowed: "strict" });
}

export { config };
