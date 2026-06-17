import { createServer } from "../../../../app/server.js";
import { auth } from "../../../../app/auth/index.js";
import { StatusCodes } from "http-status-codes";
import { setUserDetails } from "../../../../app/session/index.js";

jest.mock("../../../../app/auth");
jest.mock("../../../../app/session/index.js");

describe("Authentication route tests", () => {
  let server;
  const url = "/authenticate";

  beforeAll(async () => {
    jest.clearAllMocks();
    server = await createServer();
  });

  afterEach(async () => {
    await server.stop();
  });

  describe("Authenticate POST request", () => {
    const method = "POST";
    test("POST /authenticate route redirects to '/claims'", async () => {
      auth.authenticate.mockResolvedValueOnce(["user1", ["role1", "role2"]]);

      const response = await server.inject({
        method: "POST",
        url,
        payload: "code=abc123",
        headers: { "content-type": "application/x-www-form-urlencoded" },
      });

      expect(response.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
      expect(response.headers.location).toEqual("/claims");

      expect(auth.authenticate).toHaveBeenCalledWith(
        "abc123",
        expect.anything(),
        expect.anything(),
      );
      expect(setUserDetails).toHaveBeenCalledWith(expect.anything(), "user", "user1");
      expect(setUserDetails).toHaveBeenCalledWith(expect.anything(), "roles", "Role1, Role2");
    });

    test("POST /authenticate route returns a 500 error due to try catch", async () => {
      auth.authenticate.mockImplementation(() => {
        throw new Error();
      });
      const options = {
        method,
        url,
      };

      const response = await server.inject(options);
      expect(response.statusCode).toBe(500);
    });
  });
});
