import joi from "joi";
import { authConfig } from "./auth.js";

const SECONDS_PER_HOUR = 3600;
const MILLISECONDS_PER_SECOND = 1000;
const HOURS_PER_HALF_DAY = 12;

const getConfigSchema = () =>
  joi.object({
    cache: {
      expiresIn: joi.number().required(),
      options: {
        host: joi.string(),
        keyPrefix: joi.string(),
        username: joi.string().allow(""),
        password: joi.string().allow(""),
        useSingleInstanceCache: joi.boolean(),
        useTLS: joi.boolean(),
      },
    },
    cookie: {
      cookieNameCookiePolicy: joi.string().required(),
      cookieNameAuth: joi.string().required(),
      cookieNameSession: joi.string().required(),
      isSameSite: joi.string().required(),
      isSecure: joi.boolean().required(),
      password: joi.string().min(32).required(),
      ttl: joi.number().required(),
    },
    env: joi.string().valid("development", "test", "production").required(),
    isDev: joi.boolean().required(),
    isProd: joi.boolean().required(),
    isTest: joi.boolean().required(),
    isMetricsEnabled: joi.boolean().required(),
    port: joi.number().required(),
    serviceUri: joi.string().uri().required(),
    useRedis: joi.boolean().required(),
    applicationApiUri: joi.string().uri().required(),
    displayPageSize: joi.number().required(),
    superAdmins: joi.array().items(joi.string()).required(),
    proxy: joi.string().optional(),
    serviceVersion: joi.string().required(),
    name: joi.string().required(),
    logLevel: joi.string().required(),
    logFormat: joi.string().required(),
    logRedact: joi.array().items(joi.string()),
    perfTestEnabled: joi.boolean().required(),
  });

const buildConfig = () => {
  const conf = {
    cache: {
      expiresIn: MILLISECONDS_PER_SECOND * SECONDS_PER_HOUR * HOURS_PER_HALF_DAY,
      options: {
        host: process.env.REDIS_HOST || "redis-hostname.default",
        keyPrefix: process.env.REDIS_KEY_PREFIX || "ahwr-backoffice-ui",
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        useSingleInstanceCache: process.env.NODE_ENV !== "production",
        useTLS: process.env.NODE_ENV === "production",
      },
    },
    cookie: {
      cookieNameCookiePolicy: "ffc_ahwr_backoffice_cookie_policy",
      cookieNameAuth: "ffc_ahwr_backoffice_auth",
      cookieNameSession: "ffc_ahwr_backoffice_session",
      isSameSite: "Lax",
      isSecure: process.env.NODE_ENV === "production",
      password:
        process.env.COOKIE_PASSWORD ?? "set_a_secure_cookie_password_of_at_least_32_characters",
      ttl: MILLISECONDS_PER_SECOND * SECONDS_PER_HOUR * HOURS_PER_HALF_DAY,
    },
    env: process.env.NODE_ENV,
    isDev: process.env.NODE_ENV === "development",
    isProd: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
    isMetricsEnabled: process.env.NODE_ENV === "production",
    perfTestEnabled: process.env.PERF_TEST_ENABLED === "true",
    port: process.env.PORT,
    serviceUri: process.env.AHWR_SERVICE_URI,
    useRedis: process.env.NODE_ENV !== "test",
    applicationApiUri: process.env.AHWR_APPLICATION_BACKEND_URL,
    displayPageSize: Number(process.env.DISPLAY_PAGE_SIZE ?? "20"),
    superAdmins: process.env.SUPER_ADMINS
      ? process.env.SUPER_ADMINS.split(",").map((user) => user.trim().toLowerCase())
      : [],
    proxy: process.env.HTTP_PROXY,
    serviceVersion: process.env.SERVICE_VERSION,
    name: process.env.SERVICE_NAME ?? "ahwr-backoffice-ui",
    logLevel: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "test" ? "silent" : "info"),
    logFormat: process.env.USE_PRETTY_PRINT === "true" ? "pino-pretty" : "ecs",
    logRedact: process.env.LOG_REDACT
      ? process.env.LOG_REDACT.split(",")
      : ["req.headers", "res.headers"],
  };

  if (process.env.NODE_ENV === "test") {
    return { ...conf, auth: authConfig };
  }

  const schema = getConfigSchema();
  const { error } = schema.validate(conf, { abortEarly: false });

  if (error) {
    throw new Error(`The server config is invalid. ${error.message}`);
  }

  return { ...conf, auth: authConfig };
};

export const config = buildConfig();
