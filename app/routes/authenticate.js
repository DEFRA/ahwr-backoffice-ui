import { auth } from "../auth/index.js";
import { StatusCodes } from "http-status-codes";
import { setUserDetails } from "../session/index.js";
import { upperFirstLetter } from "../lib/display-helper.js";

export const authenticateRoute = {
  method: "POST",
  path: "/authenticate",
  options: {
    auth: { mode: "try" },
    plugins: { crumb: false },
  },
  handler: async (request, h) => {
    try {
      const [username, roles] = await auth.authenticate(
        request.payload.code,
        request.server.plugins.auth,
        request.cookieAuth,
      );
      setUserDetails(request, "user", username);
      setUserDetails(request, "roles", roles.map((x) => upperFirstLetter(x)).join(", "));
      return h.redirect("/claims");
    } catch (error) {
      request.logger.error({ error });
    }

    return h.view("error-pages/500").code(StatusCodes.INTERNAL_SERVER_ERROR);
  },
};
