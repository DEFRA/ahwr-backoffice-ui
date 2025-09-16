import { config } from '../config/config.js'
import { ConfidentialClientApplication, LogLevel } from '@azure/msal-node'

const isProd = config.get('isProduction')
const auth = config.get('auth')
const authRedirectUrl = config.get('auth.redirectUrl')

const msalLogging = isProd
  ? {}
  : {
      loggerCallback(_loglevel, message, _containsPii) {
        console.log(message)
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Verbose
    }

let msalClientApplication

export const init = () => {
  msalClientApplication = new ConfidentialClientApplication({
    auth,
    system: { loggerOptions: msalLogging }
  })
}

export const getAuthenticationUrl = () => {
  const authCodeUrlParameters = {
    prompt: 'select_account', // Force the MS account select dialog
    redirectUri: authRedirectUrl
  }

  return msalClientApplication.getAuthCodeUrl(authCodeUrlParameters)
}

export const authenticate = async (redirectCode, cookieAuth) => {
  const token = await msalClientApplication.acquireTokenByCode({
    code: redirectCode,
    redirectUri: authRedirectUrl
  })

  cookieAuth.set({
    scope: token.idTokenClaims.roles,
    account: token.account
  })
}

export const refresh = async (account, cookieAuth) => {
  const token = await msalClientApplication.acquireTokenSilent({
    account,
    forceRefresh: true
  })

  cookieAuth.set({
    scope: token.idTokenClaims.roles,
    account: token.account
  })

  return token.idTokenClaims.roles
}

export const logout = async (account) => {
  try {
    await msalClientApplication.getTokenCache().removeAccount(account)
  } catch (err) {
    console.error('Unable to end session', err)
  }
}
