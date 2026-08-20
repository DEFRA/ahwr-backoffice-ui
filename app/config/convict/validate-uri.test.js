import { convictValidateUri } from "./validate-uri.js";

describe("convictValidateUri", () => {
  test("accepts a valid URI", () => {
    expect(() => convictValidateUri.validate("https://example.com")).not.toThrow();
  });

  test("accepts a URI without a TLD (lenient, unlike convict-format-with-validator)", () => {
    expect(() => convictValidateUri.validate("https://ahwr-application-backend")).not.toThrow();
  });

  test("rejects a value that is not a URI", () => {
    expect(() => convictValidateUri.validate("not a uri")).toThrow();
  });
});
