import path from 'path'
import hapi from '@hapi/hapi'

import { router } from './router.js'
import { config } from '../config/config.js'
import { pulse } from './common/helpers/pulse.js'
import { catchAll } from './common/helpers/errors.js'
import { nunjucksConfig } from '../config/nunjucks/nunjucks.js'
import { setupProxy } from './common/helpers/proxy/setup-proxy.js'
import { requestTracing } from './common/helpers/request-tracing.js'
import { getCacheEngine } from './common/helpers/session-cache/cache-engine.js'
import { secureContext } from '@defra/hapi-secure-context'
import { authPlugin } from '../plugins/auth.js'
import { crumbPlugin } from '../plugins/crumb.js'
import { errorPagesPlugin } from '../plugins/error-pages.js'
import { loggerPlugin } from '../plugins/logger.js'
import { sessionPlugin } from '../plugins/session.js'
import { cookiePlugin } from '../plugins/cookies.js'
import { headerPlugin } from '../plugins/header.js'
import { inertPlugin } from '../plugins/inert.js'

export async function createServer() {
  setupProxy()
  const server = hapi.server({
    host: config.get('host'),
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      },
      files: {
        relativeTo: path.resolve(config.get('root'), '.public')
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    },
    cache: [
      {
        name: config.get('session.cache.name'),
        engine: getCacheEngine(config.get('session.cache.engine'))
      }
    ],
    state: {
      strictHeader: false
    }
  })
  await server.register([
    authPlugin,
    requestTracing,
    secureContext,
    pulse,
    sessionPlugin,
    nunjucksConfig,
    router, // Register all the controllers/routes defined in src/server/router.js
    inertPlugin,
    headerPlugin,
    cookiePlugin,
    crumbPlugin,
    errorPagesPlugin,
    loggerPlugin
  ])

  server.ext('onPreResponse', catchAll)

  return server
}
