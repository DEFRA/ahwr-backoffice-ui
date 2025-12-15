import { msalLogging } from '../../../app/auth/azure-auth.js'
import { getLogger } from '../../../app/logging/logger.js'
import { LogLevel } from '@azure/msal-node'

jest.mock("../../../app/logging/logger.js")

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}

describe("Azure auth test", () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'production'
  })
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("error message from msal-node is output to error logger", () => {
    getLogger.mockImplementationOnce(() => mockLogger)
    msalLogging.loggerCallback(LogLevel.Error, "test message")
    expect(mockLogger.error).toHaveBeenCalledWith('test message')
  });

  test("warning message from msal-node is output to warn logger", () => {
    getLogger.mockImplementationOnce(() => mockLogger)
    msalLogging.loggerCallback(LogLevel.Warning, "test message")
    expect(mockLogger.warn).toHaveBeenCalledWith('test message')
  });

  test("info message from msal-node is output to error logger", () => {
    getLogger.mockImplementationOnce(() => mockLogger)
    msalLogging.loggerCallback(LogLevel.Info, "test message")
    expect(mockLogger.info).toHaveBeenCalledWith('test message')
  });

});
