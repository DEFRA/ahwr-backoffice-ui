export const viewContextPlugin = {
  plugin: {
    name: "view-context",
    register: (server, _) => {
      server.ext("onPreResponse", (request, h) => {
        const response = request.response;

        if (response.variety === "view") {
          const ctx = response.source.context || {};

          // fallback value for routes where Blankie doesn't touch the context
          ctx.cspNonce = ctx.nonce ?? request.plugins.blankie?.nonces?.script;

          response.source.context = ctx;
        }

        return h.continue;
      });
    },
  },
};
