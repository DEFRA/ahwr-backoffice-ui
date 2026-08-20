import { convictValidateCookiePassword } from "./validate-cookie-password.js";

describe("convictValidateCookiePassword", () => {
  test("accepts a password of at least 32 characters", () => {
    expect(() => convictValidateCookiePassword.validate("a".repeat(32))).not.toThrow();
  });

  test("rejects a password shorter than 32 characters", () => {
    expect(() => convictValidateCookiePassword.validate("tooshort")).toThrow();
  });

  test("rejects a missing password", () => {
    expect(() => convictValidateCookiePassword.validate(undefined)).toThrow();
  });
});
