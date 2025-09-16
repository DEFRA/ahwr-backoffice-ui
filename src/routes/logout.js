import { auth } from '../auth/index.js'

const logOut = {
  method: 'GET',
  path: '/logout',
  handler: async (request, h) => {
    try {
      request.auth?.credentials?.account &&
        (await auth.logout(request.auth.credentials.account))
      request.cookieAuth.clear()
      return h.redirect('/login')
    } catch (err) {
      request.logger.setBindings({ err })
      throw err
    }
  }
}

export const logOutRoute = {
  plugin: {
    name: 'logOut',
    register(server) {
      server.route([logOut])
    }
  }
}
