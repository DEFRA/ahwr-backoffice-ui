import boom from "@hapi/boom";
import { lookupSubmissionCrumb, cacheSubmissionCrumb } from "./crumb-cache.js";
import { preSubmissionHandler } from "./pre-submission-handler.js";

jest.mock("./crumb-cache.js");

const buildRequest = (method) => ({
  method,
  plugins: { crumb: "a-crumb" },
  logger: { warn: jest.fn() },
});

describe("preSubmissionHandler", () => {
  const h = { continue: Symbol("continue") };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("on a POST", () => {
    it("caches the crumb and continues for a first submission", async () => {
      lookupSubmissionCrumb.mockResolvedValue({});
      const request = buildRequest("post");

      const result = await preSubmissionHandler(request, h);

      expect(cacheSubmissionCrumb).toHaveBeenCalledWith(request);
      expect(request.logger.warn).not.toHaveBeenCalled();
      expect(result).toBe(h.continue);
    });

    it("forbids and does not re-cache a duplicate submission", async () => {
      lookupSubmissionCrumb.mockResolvedValue({ crumb: "a-crumb" });
      const request = buildRequest("post");

      const result = await preSubmissionHandler(request, h);

      expect(result).toBeInstanceOf(Error);
      expect(boom.isBoom(result)).toBe(true);
      expect(result.output.statusCode).toBe(403);
      expect(cacheSubmissionCrumb).not.toHaveBeenCalled();
    });

    it("logs a warning with the crumb when it spots a duplicate", async () => {
      lookupSubmissionCrumb.mockResolvedValue({ crumb: "a-crumb" });
      const request = buildRequest("post");

      await preSubmissionHandler(request, h);

      expect(request.logger.warn).toHaveBeenCalledWith(
        { crumb: request.plugins.crumb },
        "Duplicate submission",
      );
    });
  });

  it("continues without touching the crumb cache for a non-POST request", async () => {
    const request = buildRequest("get");

    const result = await preSubmissionHandler(request, h);

    expect(lookupSubmissionCrumb).not.toHaveBeenCalled();
    expect(cacheSubmissionCrumb).not.toHaveBeenCalled();
    expect(result).toBe(h.continue);
  });
});
