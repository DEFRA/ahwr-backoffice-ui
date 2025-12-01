import { auth } from "../auth/index.js";

export const logOutRoute = {
  method: "GET",
  path: "/logout",
  handler: async (request, h) => {
    try {
      request.auth?.credentials?.account && (await auth.logout(request.auth.credentials.account));
      request.cookieAuth.clear();
      return h.redirect("/login");
    } catch (error) {
      request.logger.error({ error });
      throw error;
    }
  },
};
