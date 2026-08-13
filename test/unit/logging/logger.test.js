import { getLogger } from "../../../app/logging/logger.js";

describe("logger construction", () => {
  const stubLogger = () => ({ info: jest.fn(), error: jest.fn() });

  beforeEach(() => {
    jest.resetModules();
  });

  test("does not construct a pino logger when the module is imported", () => {
    const pino = jest.fn(stubLogger);
    jest.doMock("pino", () => ({ pino }));

    require("../../../app/logging/logger.js");

    expect(pino).not.toHaveBeenCalled();
  });

  test("constructs the pino logger on the first getLogger call", () => {
    const pino = jest.fn(stubLogger);
    jest.doMock("pino", () => ({ pino }));

    require("../../../app/logging/logger.js").getLogger();

    expect(pino).toHaveBeenCalledTimes(1);
  });

  test("returns the same logger instance on every subsequent getLogger call", () => {
    jest.doMock("pino", () => ({ pino: jest.fn(stubLogger) }));

    const { getLogger: lazyGetLogger } = require("../../../app/logging/logger.js");

    expect(lazyGetLogger()).toBe(lazyGetLogger());
  });
});

describe("logger", () => {
  test("getLogger returns a pino logger instance", () => {
    const logger = getLogger();

    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
  });
});
