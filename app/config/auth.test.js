import { config } from "./index.js";

describe("auth config", () => {
  test("Should expose the auth config block", async () => {
    expect(config.get("auth")).toBeDefined();
  });

  test("Should not expose a client secret", async () => {
    expect(config.get("auth")).not.toHaveProperty("clientSecret");
  });
});
