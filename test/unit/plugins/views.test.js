import { removeUnexpectedUsername } from "../../../app/plugins/views.js";

describe("views", () => {
  it("remove user from view context if user to check is different", async () => {
    const context = {
      user: {
        username: "unexpectedUser",
      },
      check_username: "expectedUser",
    };

    removeUnexpectedUsername(context);

    expect(context.user).toBeUndefined();
  });

  it("leave user from view context if user to check is same", async () => {
    const context = {
      user: {
        username: "expectedUser",
      },
      check_username: "expectedUser",
    };

    removeUnexpectedUsername(context);

    expect(context.user).toEqual({
      username: "expectedUser",
    });
  });

  it("leave user in view context if no user to check", async () => {
    const context = {
      user: {
        username: "expectedUser",
      },
    };

    removeUnexpectedUsername(context);

    expect(context.user).toEqual({
      username: "expectedUser",
    });
  });

  it("Do nothing if no user in view context", async () => {
    const context = {
      check_username: "expectedUser",
    };

    removeUnexpectedUsername(context);

    expect(context.user).toBeUndefined();
  });
});
