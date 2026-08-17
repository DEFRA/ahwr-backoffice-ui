// Ambient types for the custom Jest matchers registered in test/integration-setup.js
interface CustomMatchers<R = unknown> {
  /**
   * Asserts the response rendered exactly one element matching `selector`
   * whose text contains `content`.
   *
   * @param selector - a cheerio/CSS selector, e.g. "#claimDocument"
   * @param content - text the element is expected to contain (default "entry")
   * @example expect(response).toShow("#claimDocument");
   */
  toShow(selector: string, content?: string): R;

  /**
   * Asserts the loaded cheerio document shows the standard GOV.UK beta phase banner.
   *
   * @example
   * const $ = cheerio.load(response.payload);
   * expect($).toShowPhaseBanner();
   */
  toShowPhaseBanner(): R;
}

declare global {
  namespace jest {
    interface Matchers<R> extends CustomMatchers<R> {}
  }
}

export {};
