const assets = {
  method: 'GET',
  path: '/assets/{path*}',
  options: {
    auth: false,
    tags: ['assets'],
    handler: {
      directory: {
        path: [
          'src/frontend/dist',
          'node_modules/govuk-frontend/dist/govuk/assets'
        ]
      }
    },
    cache: {
      privacy: 'private'
    }
  }
}

export const assetsRoute = {
  plugin: {
    name: 'assets',
    register(server) {
      server.route([assets])
    }
  }
}
