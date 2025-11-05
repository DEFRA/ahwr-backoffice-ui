import { config } from "./config/index.js";
import Hapi from "@hapi/hapi";
import { authPlugin } from "./plugins/auth.js";
import { cookiePlugin } from "./plugins/cookies.js";
import { crumbPlugin } from "./plugins/crumb.js";
import { errorPagesPlugin } from "./plugins/error-pages.js";
import { routerPlugin } from "./plugins/router.js";
import { sessionPlugin } from "./plugins/session.js";
import { viewsPlugin } from "./plugins/views.js";
import { inertPlugin } from "./plugins/inert.js";
import { loggingContextPlugin } from "./plugins/logging-context.js";
import { setupProxy } from "./lib/setup-proxy.js";
import { getCacheEngine } from "./cache/get-cache-engine.js";
import { requestLogger } from "./logging/request-logger.js";

export async function createServer() {
  setupProxy()
  const server = Hapi.server({
    cache: [getCacheEngine()],
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false,
        },
      },
    },
    router: {
      stripTrailingSlash: true,
    },
  });

  const submissionCrumbCache = server.cache({
    expiresIn: 1000 * 60 * 60 * 24,
    segment: "submissionCrumbs",
  }); // 24 hours
  server.app.submissionCrumbCache = submissionCrumbCache;

  await server.register(authPlugin);
  await server.register(crumbPlugin);
  await server.register(inertPlugin.plugin);
  await server.register(routerPlugin);
  await server.register(viewsPlugin);
  await server.register(sessionPlugin);
  await server.register(requestLogger);
  await server.register(cookiePlugin);
  await server.register(errorPagesPlugin);
  await server.register(loggingContextPlugin);

  return server;
}
