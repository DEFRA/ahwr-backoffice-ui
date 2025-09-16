import { auth } from '../auth/index.js'

const authenticate = {
  method: 'GET',
  path: '/authenticate',
  options: {
    auth: { mode: 'try' }
  },
  handler: async (request, h) => {
    try {
      await auth.authenticate(request.query.code, request.cookieAuth)
      return h.redirect('/agreements') // TODO switch back to /claims
    } catch (err) {
      request.logger.setBindings({ err })
      request.logger.error(err.message)
    }

    return h.view('error-pages/500').code(500)
  }
}

export const authenticateRoute = {
  plugin: {
    name: 'authenticate',
    register(server) {
      server.route([authenticate])
    }
  }
}
