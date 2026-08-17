import { viewContextPlugin } from "./view-context.js";

describe("View Context Plugin", () => {
  let onPreResponseHandler;
  const mockH = { continue: Symbol("continue") };

  beforeAll(() => {
    const mockServer = {
      ext: (event, handler) => {
        if (event === "onPreResponse") {
          onPreResponseHandler = handler;
        }
      },
    };
    viewContextPlugin.plugin.register(mockServer);
  });

  it("exposes the Blankie script nonce to the view context", () => {
    const mockRequest = {
      plugins: { blankie: { nonces: { script: "test-nonce" } } },
      response: {
        variety: "view",
        source: {
          template: "support",
          context: {},
        },
      },
    };

    const result = onPreResponseHandler(mockRequest, mockH);

    expect(mockRequest.response.source.context.cspNonce).toBe("test-nonce");
    expect(result).toBe(mockH.continue);
  });

  it("prefers Blankie's own context.nonce over the request-scoped nonce", () => {
    const mockRequest = {
      plugins: {},
      response: {
        variety: "view",
        source: {
          template: "view-claim",
          context: { nonce: "blankie-fallback-nonce" },
        },
      },
    };

    onPreResponseHandler(mockRequest, mockH);

    expect(mockRequest.response.source.context.cspNonce).toBe("blankie-fallback-nonce");
  });

  it("creates a context object when the view has none", () => {
    const mockRequest = {
      plugins: { blankie: { nonces: { script: "another-nonce" } } },
      response: {
        variety: "view",
        source: {
          template: "support",
        },
      },
    };

    onPreResponseHandler(mockRequest, mockH);

    expect(mockRequest.response.source.context.cspNonce).toBe("another-nonce");
  });

  it("does nothing when the response is not a view", () => {
    const mockRequest = {
      plugins: { blankie: { nonces: { script: "test-nonce" } } },
      response: {
        variety: "plain",
      },
    };

    const result = onPreResponseHandler(mockRequest, mockH);

    expect(mockRequest.response.source).toBeUndefined();
    expect(result).toBe(mockH.continue);
  });
});
