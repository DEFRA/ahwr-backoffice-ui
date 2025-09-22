import { config } from '../config/config.js'

const serviceUri = config.get('serviceUri')

const getSecurityPolicy = () =>
  "default-src 'self';" +
  "object-src 'none';" +
  "script-src 'self' www.google-analytics.com *.googletagmanager.com ajax.googleapis.com *.googletagmanager.com/gtm.js 'unsafe-inline' 'unsafe-eval' 'unsafe-hashes';" +
  "form-action 'self';" +
  "base-uri 'self';" +
  "connect-src 'self' *.google-analytics.com *.analytics.google.com *.googletagmanager.com" +
  "style-src 'self' 'unsafe-inline' tagmanager.google.com *.googleapis.com;" +
  "img-src 'self' *.google-analytics.com *.googletagmanager.com;"

export const headerPlugin = {
  plugin: {
    name: 'header',
    register: (server, options) => {
      server.ext('onPreResponse', (request, h) => {
        let response = request.response

        // TODO 1185 had to change implementation

        if (!response.isBoom && typeof response.header !== 'function') {
          response = h.response(response)
        }

        if (!response.isBoom) {
          ;(options?.keys || []).forEach((x) => {
            response.header(x.key, x.value)
          })
        } else {
          ;(options?.keys || []).forEach((x) => {
            response.output.headers[x.key] = x.value
          })
        }

        return h.continue
      })
    }
  },
  options: {
    keys: [
      { key: 'Test', value: 'basic' }
    ]
  }
}
