import authCookie from '@hapi/cookie'
import { auth } from '../auth/index.js'
import { config } from '../config/config.js'
import { createLogger } from '../server/common/helpers/logging/logger.js'

const cookiePassword = config.get('session.cookie.password')
const cookieTTL = config.get('session.cookie.ttl')
const isProd = config.get('isProduction')

export const authPlugin = {
  plugin: {
    name: 'auth',
    register: async (server) => {
      await server.register(authCookie)

      server.auth.strategy('session-auth', 'cookie', {
        cookie: {
          name: 'session-auth',
          password: cookiePassword,
          ttl: cookieTTL,
          path: '/',
          isSecure: isProd,
          isSameSite: 'Lax' // Needed for the post authentication redirect
        },
        keepAlive: true, // Resets the cookie ttl after each route
        redirectTo: '/login'
      })

      server.auth.default('session-auth')

      server.ext('onPreAuth', async (request, h) => {
        if (request.auth.credentials) {
          const logger = createLogger()
          logger.info('Refreshing session token...')
          await auth.refresh(
            request.auth.credentials.account,
            request.cookieAuth
          )
        }
        return h.continue
      })
    }
  }
}
