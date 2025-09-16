import { homeController } from './controller.js'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const home = {
  plugin: {
    name: 'demo1',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/demo1',
          options: {
            auth: false
          },
          ...homeController
        }
      ])
    }
  }
}
