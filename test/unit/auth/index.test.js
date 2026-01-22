import { config } from '../../../app/config/index.js'
import { auth as authIndex } from '../../../app/auth/index.js'
import { init } from '../../../app/auth/azure-auth.js'
import * as realAuth from '../../../app/auth/azure-auth.js'
import * as devAuth from '../../../app/auth/dev-auth.js'
import { getLogger } from '../../../app/logging/logger.js'

jest.mock('../../../app/auth/azure-auth.js')
jest.mock('../../../app/auth/dev-auth.js')
jest.mock('../../../app/logging/logger.js')

describe('auth index', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  describe('initAuth', () => {
    it('calls realAuth.init when auth is enabled', async () => {
      config.auth.enabled = true
      authIndex.initAuth()
      expect(init).toHaveBeenCalled()
    })
    it('does not call realAuth.init when auth is not enabled', async () => {
      config.auth.enabled = false
      authIndex.initAuth()
      expect(init).not.toHaveBeenCalled()
    })
  })

  describe('authenticate', () => {
    it('when auth is enabled calls realAuth authenticate', async () => {
      config.auth.enabled = true
      const mockAuth = {}
      const mockCookieAuth = {}
      await authIndex.authenticate('code', mockAuth, mockCookieAuth)
      expect(realAuth.authenticate).toHaveBeenCalledWith('code', mockAuth, mockCookieAuth)
      expect(devAuth.authenticate).not.toHaveBeenCalled()
    })
    it('when auth is disabled calls devAuth authenticate', async () => {
      config.auth.enabled = false
      const mockAuth = {}
      const mockCookieAuth = {}
      await authIndex.authenticate('code', mockAuth, mockCookieAuth)
      expect(devAuth.authenticate).toHaveBeenCalledWith('code', mockAuth, mockCookieAuth)
      expect(realAuth.authenticate).not.toHaveBeenCalled()
    })
  })

  describe('getAuthenticationUrl', () => {
    it('when auth is enabled calls realAuth getAuthenticationUrl', () => {
      config.auth.enabled = true
      authIndex.getAuthenticationUrl()
      expect(realAuth.getAuthenticationUrl).toHaveBeenCalled()
      expect(devAuth.getAuthenticationUrl).not.toHaveBeenCalled()
    })
    it('when auth is disabled calls devAuth getAuthenticationUrl', () => {
      config.auth.enabled = false
      const userId = 'test-user'
      authIndex.getAuthenticationUrl(userId)
      expect(devAuth.getAuthenticationUrl).toHaveBeenCalledWith(userId)
      expect(realAuth.getAuthenticationUrl).not.toHaveBeenCalled()
    })
  })


  describe('logout', () => {
    it('when auth is enabled calls realAuth logout', () => {
      config.auth.enabled = true
      const mockAccount = {}
      authIndex.logout(mockAccount)
      expect(realAuth.logout).toHaveBeenCalledWith(mockAccount)
      expect(devAuth.logout).not.toHaveBeenCalled()
    })
    it('when auth is disabled calls devAuth logout', () => {
      config.auth.enabled = false
      const mockAccount = {}
      authIndex.logout(mockAccount)
      expect(devAuth.logout).toHaveBeenCalledWith(mockAccount)
      expect(realAuth.logout).not.toHaveBeenCalled()
    })
  })

  describe('toggleAuthMode', () => {
    const mockLogger = {
      info: jest.fn(),
    }

    beforeEach(() => {
      getLogger.mockReturnValue(mockLogger)
      config.auth.enabled = true
    })
    it('enables perf test auth mode when userId starts with "perfteston"', () => {
      config.perfTestEnabled = true

      authIndex.getAuthenticationUrl('perfteston123')
      expect(mockLogger.info).toHaveBeenCalledWith('Enabling perf test auth mode')
      // after toggle on, should call through to dev auth method
      expect(devAuth.getAuthenticationUrl).toHaveBeenCalled()
      expect(realAuth.getAuthenticationUrl).not.toHaveBeenCalled()
    })
    it('disables perf test auth mode when userId starts with "perftestoff"', () => {
      config.perfTestEnabled = true

      authIndex.getAuthenticationUrl('perftestoff123')
      expect(mockLogger.info).toHaveBeenCalledWith('Disabling perf test auth mode')
      // after toggle off, should call through to real auth method
      expect(realAuth.getAuthenticationUrl).toHaveBeenCalled()
      expect(devAuth.getAuthenticationUrl).not.toHaveBeenCalled()
    })
    it('does not change perf test auth mode when userId does not start with perf test strings', () => {
      config.perfTestEnabled = true

      authIndex.getAuthenticationUrl('perfteston123')

      authIndex.getAuthenticationUrl('regularuser')
      // just called once on initial switch
      expect(mockLogger.info).toHaveBeenCalledTimes(1)
      // but both calls go through to dev auth as mode remains on
      expect(devAuth.getAuthenticationUrl).toHaveBeenCalledTimes(2)
    })
  })
})