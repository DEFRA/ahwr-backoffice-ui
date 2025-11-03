import { StatusCodes } from "http-status-codes";

export const healthRoute = {
  method: "GET",
  path: "/health",
  options: {
    auth: false,
    plugins: {
      yar: { skip: true },
    },
    handler: (_, h) => {
      return h.response("ok").code(StatusCodes.OK);
    },
  },
};
