import { StatusCodes } from "http-status-codes";

export const errorPagesPlugin = {
  plugin: {
    name: "error-pages",
    register: (server, _) => {
      server.ext("onPreResponse", (request, h) => {
        const { response } = request;

        if (response.isBoom) {
          const baseOptions = { check_username: request.auth?.credentials?.account?.username };
          const { statusCode, message } = response.output.payload;

          const originalError = response instanceof Error ? response : response.data?.error;
          const firstLineOfError = originalError?.stack.split("\n")[0] ?? message;

          request.logger.error(
            {
              error: {
                code: statusCode,
                message,
                stack_trace: originalError?.stack,
                id: request.logger.mixins?.trace?.id,
              },
              event: {
                type: "exception",
                category: "error-on-page-render",
                reason: message,
              },
            },
            firstLineOfError,
          );

          if (statusCode === StatusCodes.NOT_FOUND) {
            // handled specifically by a route handler that renders a 404 page for unknown pages. This allows us to still track which user it is
            return h.continue;
          }

          if (
            statusCode >= StatusCodes.BAD_REQUEST &&
            statusCode < StatusCodes.INTERNAL_SERVER_ERROR
          ) {
            return h
              .view("error-pages/4xx", { ...baseOptions, payload: response.output.payload })
              .code(statusCode);
          }

          return h.view("error-pages/500", baseOptions).code(statusCode);
        }

        return h.continue;
      });
    },
  },
};
