import { StatusCodes } from "http-status-codes";

export const cookiePlugin = {
  plugin: {
    name: "cookies",
    register: (server, _) => {
      server.ext("onPreResponse", (request, h) => {
        const statusCode = request.response.statusCode;

        if (
          request.response.variety === "view" &&
          statusCode !== StatusCodes.NOT_FOUND &&
          statusCode !== StatusCodes.INTERNAL_SERVER_ERROR &&
          request.response.source.manager._context
        ) {
          request.response.source.manager._context.currentPath = request.path;
        }

        if (request.response.source?.manager?._context) {
          if (request.auth?.credentials?.account) {
            request.response.source.manager._context.user = request.auth?.credentials?.account;
            request.response.source.manager._context.scope = request.auth?.credentials?.scope;
            request.logger.info(
              `User: ${request.auth?.credentials?.account}, scope: ${request.auth?.credentials?.scope}`,
            );
          } else {
            // This is so that we arent caching the previous context user
            request.response.source.manager._context.user = undefined;
            request.response.source.manager._context.scope = undefined;
          }
        }

        return h.continue;
      });
    },
  },
};
