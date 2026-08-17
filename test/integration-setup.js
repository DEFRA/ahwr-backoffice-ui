import * as cheerio from "cheerio";

expect.extend({
  /**
   * Asserts a Hapi response rendered exactly one element matching `selector`
   * whose text contains `content`.
   *
   * @param {{ payload: string }} response - the injected Hapi response
   * @param {string} selector - a cheerio/CSS selector, e.g. "#claimDocument"
   * @param {string} [content="entry"] - text the element is expected to contain
   * @returns {{ pass: boolean, message: () => string }}
   * @example
   * expect(response).toShow("#claimDocument");
   * expect(response).toShow("#claimDocument", "someValue");
   */
  toShow(response, selector, content = "entry") {
    const element = cheerio.load(response.payload)(selector);
    const pass = element.length === 1 && element.text().includes(content);
    return {
      pass,
      message: () =>
        pass
          ? `expected response not to show a single "${selector}" containing "${content}"`
          : `expected response to show a single "${selector}" containing "${content}", ` +
            `but found ${element.length} matching element(s) with text "${element.text()}"`,
    };
  },

  /**
   * Asserts a page shows the standard GOV.UK beta phase banner.
   *
   * @param {import("cheerio").CheerioAPI} $ - a loaded cheerio document
   * @returns {{ pass: boolean, message: () => string }}
   * @example
   * const $ = cheerio.load(response.payload);
   * expect($).toShowPhaseBanner();
   */
  toShowPhaseBanner($) {
    const banner = $(".govuk-phase-banner");
    const text = banner.text();
    const pass =
      banner.length === 1 && text.includes("beta") && text.includes("This is a new service");
    return {
      pass,
      message: () =>
        pass
          ? `expected not to show the beta phase banner`
          : `expected to show exactly one beta phase banner reading "This is a new service", ` +
            `but found ${banner.length} banner(s) with text "${text}"`,
    };
  },
});

if (typeof document !== "undefined") {
  const { toHaveNoViolations } = require("jest-axe");
  expect.extend(toHaveNoViolations);
}
