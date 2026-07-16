import {
  createModel,
  getApplicationTableHeader,
} from "../../../../../app/routes/models/application-list.js";
import { applicationsData } from "../../../../data/applications.js";
import { getApplications } from "../../../../../app/api/applications.js";
import {
  getAgreementTypeOptions,
  getStatusOptions,
} from "../../../../../app/routes/utils/get-agreement-type-options.js";
import { AGREEMENT_STATUS, AGREEMENT_TYPE } from "../../../../../app/constants/index.js";
import { permissions } from "../../../../../app/auth/permissions.js";

jest.mock("../../../../../app/api/applications");

const { administrator } = permissions;

const emptyDateItems = [
  { name: "day", classes: "govuk-input--width-2", value: "" },
  { name: "month", classes: "govuk-input--width-2", value: "" },
  { name: "year", classes: "govuk-input--width-4", value: "" },
];

describe("Application-list model test", () => {
  test.each([
    { n: 0, field: "Reference", direction: "DESC" },
    { n: 0, field: "Reference", direction: "ASC" },
    { n: 2, field: "Organisation", direction: "DESC" },
    { n: 2, field: "Organisation", direction: "ASC" },
    { n: 3, field: "SBI", direction: "DESC" },
    { n: 3, field: "SBI", direction: "ASC" },
    { n: 4, field: "Apply date", direction: "DESC" },
    { n: 4, field: "Apply date", direction: "ASC" },
    { n: 5, field: "Status", direction: "DESC" },
    { n: 5, field: "Status", direction: "ASC" },
  ])("getApplicationTableHeader $field $direction", async ({ n, field, direction }) => {
    const sortField = { field, direction };
    const ariaSort = direction === "DESC" ? "descending" : "ascending";
    const res = getApplicationTableHeader(sortField);
    expect(res).not.toBeNull();
    expect(res[n].attributes["aria-sort"]).toEqual(ariaSort);
  });

  test.each([
    { n: 0, field: "Reference", direction: "DESC" },
    { n: 0, field: "Reference", direction: "ASC" },
    { n: 2, field: "Organisation", direction: "DESC" },
    { n: 2, field: "Organisation", direction: "ASC" },
    { n: 3, field: "SBI", direction: "DESC" },
    { n: 3, field: "SBI", direction: "ASC" },
    { n: 4, field: "Apply date", direction: "DESC" },
    { n: 4, field: "Apply date", direction: "ASC" },
    { n: 5, field: "Status", direction: "DESC" },
    { n: 5, field: "Status", direction: "ASC" },
  ])("getApplicationTableHeader $field $direction", async ({ n, field, direction }) => {
    const sortField = { field, direction };
    const res = getApplicationTableHeader(sortField);
    expect(res).not.toBeNull();
  });
});

describe("Application-list createModel", () => {
  beforeAll(() => {
    getApplications.mockImplementation(() => applicationsData);
  });

  afterAll(() => {
    getApplications.mockClear();
  });

  test("createModel should return view claims when type EE", async () => {
    const request = {
      yar: { get: jest.fn() },
      query: {},
      auth: {
        isAuthenticated: true,
        credentials: {
          scope: [administrator],
          account: { username: "unit-tester" },
        },
      },
    };
    const result = await createModel(request, 1);
    expect(result.applications[0][5].html).toContain("Agreed");
    expect(result.total).toBe(9);
  });

  test("createModel passes the session agreement type to the backend", async () => {
    getApplications.mockClear();
    const request = {
      yar: {
        get: jest.fn(() => ({
          searchText: "",
          searchType: "",
          agreementType: "IAHW",
        })),
      },
      query: {},
      auth: {
        isAuthenticated: true,
        credentials: {
          scope: [administrator],
          account: { username: "unit-tester" },
        },
      },
    };

    await createModel(request, 1);

    expect(getApplications.mock.calls[0][0]).toEqual(
      expect.objectContaining({ agreementType: "IAHW" }),
    );
  });

  test("createModel passes the session status to the backend", async () => {
    getApplications.mockClear();
    const request = {
      yar: {
        get: jest.fn(() => ({
          searchText: "",
          searchType: "",
          status: "AGREED",
        })),
      },
      query: {},
      auth: {
        isAuthenticated: true,
        credentials: {
          scope: [administrator],
          account: { username: "unit-tester" },
        },
      },
    };

    await createModel(request, 1);

    expect(getApplications.mock.calls[0][0]).toEqual(expect.objectContaining({ status: "AGREED" }));
  });

  test.each([
    { searchType: "date", searchText: "01/12/2024" },
    { searchType: "status", searchText: "agreed" },
  ])(
    "createModel returns the empty state without querying the backend for a retired '$searchType' search",
    async ({ searchType, searchText }) => {
      getApplications.mockClear();
      const request = {
        yar: {
          get: jest.fn(() => ({ searchType, searchText })),
        },
        query: {},
        auth: {
          isAuthenticated: true,
          credentials: {
            scope: [administrator],
            account: { username: "unit-tester" },
          },
        },
      };

      const result = await createModel(request, 1);

      expect(result).toEqual({
        applications: [],
        total: 0,
        error: "No agreements found.",
        searchText,
        agreementTypeOptions: getAgreementTypeOptions(AGREEMENT_TYPE.ALL),
        agreementDateFrom: emptyDateItems,
        agreementDateTo: emptyDateItems,
        statusOptions: getStatusOptions(AGREEMENT_STATUS.ALL),
      });
      expect(getApplications).not.toHaveBeenCalled();
    },
  );

  test("passes valid agreement date filters from the session to the backend as dates", async () => {
    getApplications.mockClear();
    const request = {
      yar: {
        get: jest.fn(() => ({
          searchText: "",
          searchType: "",
          agreementType: "ALL",
          dateFrom: { day: "1", month: "2", year: "2026" },
          dateTo: { day: "15", month: "7", year: "2026" },
        })),
      },
      query: {},
      auth: {
        isAuthenticated: true,
        credentials: {
          scope: [administrator],
          account: { username: "unit-tester" },
        },
      },
    };

    await createModel(request, 1);

    expect(getApplications.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        dateFrom: new Date(Date.UTC(2026, 1, 1)),
        dateTo: new Date(Date.UTC(2026, 6, 15, 23, 59, 59, 999)),
      }),
    );
  });

  test("skips agreement date filters that are incomplete or invalid", async () => {
    getApplications.mockClear();
    const request = {
      yar: {
        get: jest.fn(() => ({
          searchText: "",
          searchType: "",
          agreementType: "ALL",
          dateFrom: { day: "31", month: "2", year: "2026" },
          dateTo: { day: "", month: "", year: "" },
        })),
      },
      query: {},
      auth: {
        isAuthenticated: true,
        credentials: {
          scope: [administrator],
          account: { username: "unit-tester" },
        },
      },
    };

    await createModel(request, 1);

    expect(getApplications.mock.calls[0][0]).toEqual(
      expect.objectContaining({ dateFrom: undefined, dateTo: undefined }),
    );
  });

  test("skips both agreement date filters when the to date is before the from date", async () => {
    getApplications.mockClear();
    const request = {
      yar: {
        get: jest.fn(() => ({
          searchText: "",
          searchType: "",
          agreementType: "ALL",
          dateFrom: { day: "16", month: "7", year: "2026" },
          dateTo: { day: "15", month: "7", year: "2026" },
        })),
      },
      query: {},
      auth: {
        isAuthenticated: true,
        credentials: {
          scope: [administrator],
          account: { username: "unit-tester" },
        },
      },
    };

    await createModel(request, 1);

    expect(getApplications.mock.calls[0][0]).toEqual(
      expect.objectContaining({ dateFrom: undefined, dateTo: undefined }),
    );
  });
});
