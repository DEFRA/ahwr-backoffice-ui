import { getCacheEngine } from "./get-cache-engine.js";
import { Engine as CatboxRedis } from "@hapi/catbox-redis";
import { buildRedisClient } from "./build-redis-client.js";
import { config } from "../config/index.js";
import { getLogger } from "../logging/logger.js";

jest.mock("../logging/logger.js", () => ({
  getLogger: jest.fn(() => ({ info: jest.fn() })),
}));
jest.mock("@hapi/catbox-redis", () => ({
  Engine: jest.fn().mockImplementation(() => ({ isRedis: true })),
}));
jest.mock("./build-redis-client.js", () => ({
  buildRedisClient: jest.fn(() => ({ fakeRedisClient: true })),
}));
jest.mock("../config/index.js", () => ({
  config: require("../../test/helpers/mock-config.js").asConvict({
    useRedis: true,
  }),
}));

// getCacheEngine captures its logger once at module load
const logger = getLogger.mock.results[0].value;

describe("getCacheEngine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    config.set("useRedis", true);
    delete process.env.NODE_ENV;
  });

  it("uses a Redis engine when useRedis is true", () => {
    const engine = getCacheEngine();

    expect(buildRedisClient).toHaveBeenCalled();
    expect(CatboxRedis).toHaveBeenCalledWith({ client: { fakeRedisClient: true } });
    expect(engine.name).toBe("session");
    expect(engine.engine).toEqual({ isRedis: true });
    expect(logger.info).toHaveBeenCalledWith("Using Redis session cache");
  });

  it("uses Catbox Memory when useRedis is false", () => {
    config.set("useRedis", false);

    const engine = getCacheEngine();

    expect(buildRedisClient).not.toHaveBeenCalled();
    expect(engine.name).toBe("session");
    expect(engine.provider.constructor).toBeDefined();
    expect(logger.info).toHaveBeenCalledWith("Using Catbox Memory session cache");
  });

  it("warns when Catbox Memory is used in production", () => {
    config.set("useRedis", false);
    process.env.NODE_ENV = "production";

    getCacheEngine();

    expect(logger.info).toHaveBeenCalledWith(
      "Catbox Memory is for running tests, it should not be used in production!",
    );
  });
});
