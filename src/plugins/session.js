import yar from '@hapi/yar'
import { config as convictConfig } from '../config/config.js'

const config = convictConfig.get('session')

export const sessionPlugin = {
  plugin: yar,
  options: {
    name: config.cache.name,
    // maxCookieSize: config.useRedis ? 0 : 1024, // Non-zero cookie size required when not using redis e.g for testing
    cache: {
      cache: config.cache.name,
      expiresIn: config.cache.expiresIn
    },
    storeBlank: false,
    errorOnCacheNotReady: true,
    cookieOptions: {
      // isHttpOnly: true,
      // isSameSite: config.cookie.isSameSite,
      password: config.cookie.password,
      ttl: config.cache.expiresIn,
      isSecure: config.cookie.secure,
      clearInvalid: true
    }
  }
}
