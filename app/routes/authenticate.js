import { auth } from "../auth/index.js";
import { StatusCodes } from "http-status-codes";
import { setUserDetails } from "../session/index.js";
import { upperFirstLetter } from "../lib/display-helper.js";

export const authenticateRoute = {
  method: "GET",
  path: "/authenticate",
  options: {
    auth: { mode: "try" },
  },
  handler: async (request, h) => {
    try {
      console.log("Received request to authenticate...");
      const [username, roles] = await auth.authenticate(request.query.code, request.cookieAuth);
      console.log("Setting username");
      setUserDetails(request, "user", username);
      console.log("Setting roles");
      setUserDetails(request, "roles", roles.map((x) => upperFirstLetter(x)).join(", "));
      console.log("Redirecting to claims....")
      return h.redirect("/claims");
    } catch (err) {
      request.logger.setBindings({ error: err });
      request.logger.error(err.message);
    }

    return h.view("error-pages/500").code(StatusCodes.INTERNAL_SERVER_ERROR);
  },
};
