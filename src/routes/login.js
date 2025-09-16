import { auth } from '../auth/index.js'

const login = {
  method: 'GET',
  path: '/login',
  options: {
    auth: false
  },
  handler: async (request, h) => {
    try {
      // This is only needed for the dev login, and wont affect real logins
      const { userId } = request.query
      const authUrl = await auth.getAuthenticationUrl(userId)
      return h.redirect(authUrl)
    } catch (err) {
      request.logger.setBindings({ err })
    }
    return h.view('error-pages/500').code(500)
  }
}

export const loginRoute = {
  plugin: {
    name: 'login',
    register(server) {
      server.route([login])
    }
  }
}
