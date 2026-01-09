import { auth as authentication } from "../auth/index.js";

export const logOutRoute = {
  method: "GET",
  path: "/logout",
  handler: async (request, h) => {
    const { auth, cookieAuth } = request;

    if (auth.isAuthenticated) {
      if (auth.credentials?.account) {
        await authentication.logout(auth.credentials.account);
      }

      cookieAuth.clear();
    }

    return h.redirect("/login");
  },
};
