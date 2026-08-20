import { getApplicationStates } from "./get-application-states.js";
import { permissions } from "../../auth/permissions.js";
const { administrator } = permissions;

jest.mock("../../config", () => ({
  config: require("../../../test/helpers/mock-config.js").asConvict({
    superAdmins: ["currentuser@test"],
  }),
}));

const currentUser = "testUser";

const buildRequest = ({ query = {}, username = "" }) => ({
  query,
  auth: {
    isAuthenticated: true,
    credentials: {
      account: { name: currentUser, username },
      scope: [administrator],
    },
  },
});

describe("getApplicationStates", () => {
  test("super admin, form flag unset: action available, form closed", () => {
    const request = buildRequest({ username: "currentUser@test" });

    const state = getApplicationStates({ request });

    expect(state).toEqual({
      updateEligiblePiiRedactionAction: true,
      updateEligiblePiiRedactionForm: false,
    });
  });

  test("super admin, query: updateEligiblePiiRedaction: action and form", () => {
    const request = buildRequest({
      query: { updateEligiblePiiRedaction: true },
      username: "currentUser@test",
    });

    const state = getApplicationStates({ request });

    expect(state).toEqual({
      updateEligiblePiiRedactionAction: true,
      updateEligiblePiiRedactionForm: true,
    });
  });

  test("not a super admin: neither action nor form", () => {
    const request = buildRequest({
      query: { updateEligiblePiiRedaction: true },
      username: "notSuperAdmin@test",
    });

    const state = getApplicationStates({ request });

    expect(state).toEqual({
      updateEligiblePiiRedactionAction: false,
      updateEligiblePiiRedactionForm: false,
    });
  });
});
