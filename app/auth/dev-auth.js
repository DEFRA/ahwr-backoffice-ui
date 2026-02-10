import { permissions } from "./permissions.js";

const { administrator, processor, user, recommender, authoriser, support } = permissions;

const getDevAccount = (userId) => {
  if (userId) {
    return {
      name: `Developer-${userId}`,
      username: `developer+${userId}@defra.gov.uk`,
    };
  }

  return {
    name: "Developer",
    username: "developer@defra.gov.uk",
  };
};

export const getAuthenticationUrl = (userId) => {
  if (userId) {
    return `/dev-auth?userId=${userId}`;
  }

  return "/dev-auth";
};

const rolesByUserId = new Map([
  ["user", [user]],
  ["recommender", [user, recommender]],
  ["administrator", [user, administrator]],
  ["processor", [user, processor]],
  ["authoriser", [user, authoriser]],
  ["support", [user, support]],
]);

export const authenticate = async (userId, auth, cookieAuth) => {
  const roles = rolesByUserId.has(userId)
    ? rolesByUserId.get(userId)
    : [administrator, processor, user, recommender, authoriser, support];
  const account = getDevAccount(userId);
  const sessionId = await auth.createSession(account, roles);
  cookieAuth.set({ id: sessionId });
  return [account.username, roles];
};

export const logout = async () => {};
