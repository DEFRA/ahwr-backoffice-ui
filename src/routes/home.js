// import { permissions } from '../auth/permissions.js'

// const { administrator, processor, user, recommender, authoriser } = permissions

const home = {
  method: 'GET',
  path: '/',
  options: {
    // // TODO 1061 auth: { scope: [administrator, processor, user, recommender, authoriser] },
    handler: async (_, h) => {
      return h.redirect('/agreements') // TODO switch back to /claims
    }
  }
}

export const homeRoute = {
  plugin: {
    name: 'home',
    register(server) {
      server.route([home])
    }
  }
}
