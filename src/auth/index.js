import * as devAuth from '../auth/dev-auth.js'
import * as realAuth from '../auth/azure-auth.js'
import { mapAuth } from './map-auth.js'
import { config } from '../config/config.js'

const authEnabled = config.get('auth.enabled')

const getAuth = () => {
  if (authEnabled) {
    realAuth.init()
    return realAuth
  }

  return devAuth
}

export const auth = {
  ...getAuth(),
  mapAuth
}
