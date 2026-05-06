import { crumbPlugin } from "../../../app/plugins/crumb.js";

describe("crumb plugin", () => {
  test("is correctly configured", () => {
    expect(crumbPlugin.options.cookieOptions).toHaveProperty("isSecure");
    expect(crumbPlugin.options.cookieOptions.isSecure).toEqual(false);
  });
});
