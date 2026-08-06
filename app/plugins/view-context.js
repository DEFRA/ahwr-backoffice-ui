export const viewContextPlugin = {
  plugin: {
    name: "view-context",
    register: (server, _) => {
      server.ext("onPreResponse", (request, h) => {
        const response = request.response;

        if (response.variety === "view") {
          const ctx = response.source.context || {};

          // Blankie generates the script nonce in an onPreHandler extension, which hapi skips
          // for requests that fail payload validation and take over the response early.
          // Blankie's own onPreResponse handler - which runs before this one - always stamps whichever
          // nonce it used for the header onto response.source.context.nonce, so prefer that and only fall back to the
          // onPreHandler-set value for routes where Blankie doesn't touch the context.
          ctx.cspNonce = ctx.nonce ?? request.plugins.blankie?.nonces?.script;

          response.source.context = ctx;
        }

        return h.continue;
      });
    },
  },
};
