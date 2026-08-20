const mockValues = {
  useRedis: true,
  cache: { name: "session", expiresIn: 43200000 },
  cookie: {
    cookieNameSession: "ffc_ahwr_backoffice_session",
    isSameSite: "Lax",
    isSecure: false,
    password: "x".repeat(32),
  },
};

jest.mock("../config/index.js", () => ({
  config: require("../../test/helpers/mock-config.js").asConvict(mockValues),
}));

const loadPlugin = () => {
  let plugin;
  jest.isolateModules(() => {
    plugin = require("./session.js").sessionPlugin;
  });
  return plugin;
};

describe("sessionPlugin", () => {
  it("maps the session options from config", () => {
    const { options } = loadPlugin();

    expect(options.name).toBe("ffc_ahwr_backoffice_session");
    expect(options.cache.cache).toBe("session");
    expect(options.cache.expiresIn).toBe(43200000);
    expect(options.cookieOptions).toMatchObject({
      isHttpOnly: true,
      isSameSite: "Lax",
      isSecure: false,
      password: "x".repeat(32),
      ttl: 43200000,
    });
  });

  it("disables the cookie store size limit when using Redis", () => {
    mockValues.useRedis = true;

    expect(loadPlugin().options.maxCookieSize).toBe(0);
  });

  it("sets a non-zero cookie store size when not using Redis", () => {
    mockValues.useRedis = false;

    expect(loadPlugin().options.maxCookieSize).toBe(1024);
  });
});
