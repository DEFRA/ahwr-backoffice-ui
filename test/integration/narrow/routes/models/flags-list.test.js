import { getAllFlags } from "../../../../../app/api/flags.js";
import { createFlagsTableData } from "../../../../../app/routes/models/flags-list.js";
import { flags } from "../../../../data/flags.js";
import { config } from "../../../../../app/config/index.js";

const { serviceUri } = config;

jest.mock("../../../../../app/api/flags");

getAllFlags.mockResolvedValue(flags);

const mockLogger = {
  logger: jest.fn(),
};

describe("createFlagsTableData", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it("creates the table data from the getAllFlags API call data", async () => {
    const result = await createFlagsTableData({
      logger: mockLogger,
      isAdmin: true,
    });

    expect(result).toEqual({
      model: {
        applicationRefOfFlagToDelete: undefined,
        createFlag: undefined,
        createFlagUrl: `${serviceUri}/flags?createFlag=true`,
        flagIdToDelete: undefined,
        header: [
          { text: "Agreement number" },
          { text: "SBI" },
          { text: "Note" },
          { text: "Created by" },
          { text: "Created at" },
          { text: "Action" },
        ],
        rows: [
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Tom" },
            { text: "Invalid Date" },
            {
              html: `<a class="govuk-button govuk-button--warning" data-module="govuk-button" href="${serviceUri}/flags?deleteFlag=333c18ef-fb26-4beb-ac87-c483fc886fea">Delete flag</a>`,
            },
          ],
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Ben" },
            { text: "Invalid Date" },
            {
              html: `<a class="govuk-button govuk-button--warning" data-module="govuk-button" href="${serviceUri}/flags?deleteFlag=53dbbc6c-dd14-4d01-be11-ad288cb16b08">Delete flag</a>`,
            },
          ],
        ],
      },
    });
  });

  it("creates the table data from the getAllFlags API call data when create flag is true", async () => {
    const result = await createFlagsTableData({
      logger: mockLogger,
      flagIdToDelete: undefined,
      createFlag: true,
      isAdmin: true,
    });

    expect(result).toEqual({
      model: {
        applicationRefOfFlagToDelete: undefined,
        createFlag: true,
        createFlagUrl: `${serviceUri}/flags?createFlag=true`,
        flagIdToDelete: undefined,
        header: [
          { text: "Agreement number" },
          { text: "SBI" },
          { text: "Note" },
          { text: "Created by" },
          { text: "Created at" },
          { text: "Action" },
        ],
        rows: [
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Tom" },
            { text: "Invalid Date" },
            {
              html: `<a class="govuk-button govuk-button--warning" data-module="govuk-button" href="${serviceUri}/flags?deleteFlag=333c18ef-fb26-4beb-ac87-c483fc886fea">Delete flag</a>`,
            },
          ],
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Ben" },
            { text: "Invalid Date" },
            {
              html: `<a class="govuk-button govuk-button--warning" data-module="govuk-button" href="${serviceUri}/flags?deleteFlag=53dbbc6c-dd14-4d01-be11-ad288cb16b08">Delete flag</a>`,
            },
          ],
        ],
      },
    });
  });

  it("creates the table data from the getAllFlags API call data when create flag is true, but user is not an admin", async () => {
    const result = await createFlagsTableData({
      logger: mockLogger,
      flagIdToDelete: undefined,
      createFlag: true,
      isAdmin: false,
    });

    expect(result).toEqual({
      model: {
        applicationRefOfFlagToDelete: undefined,
        createFlag: true,
        createFlagUrl: `${serviceUri}/flags?createFlag=true`,
        flagIdToDelete: undefined,
        header: [
          { text: "Agreement number" },
          { text: "SBI" },
          { text: "Note" },
          { text: "Created by" },
          { text: "Created at" },
        ],
        rows: [
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Tom" },
            { text: "Invalid Date" },
            { html: "</>" },
          ],
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Ben" },
            { text: "Invalid Date" },
            { html: "</>" },
          ],
        ],
      },
    });
  });

  it("creates the table data from the getAllFlags API call data when create flag is true, but agreement is redacted", async () => {
    getAllFlags.mockResolvedValueOnce([
      {
        id: "333c18ef-fb26-4beb-ac87-c483fc886fea",
        applicationReference: "IAHW-U6ZE-5R5E",
        sbi: "123456789",
        note: "Flag this please",
        createdBy: "Tom",
        createdAt: "2025-04-09T11: 59: 54.075Z",
        appliesToMh: false,
        deletedAt: null,
        deletedBy: null,
        redacted: true,
      },
    ]);

    const result = await createFlagsTableData({
      logger: mockLogger,
      flagIdToDelete: undefined,
      createFlag: true,
      isAdmin: true,
    });

    expect(result).toEqual({
      model: {
        applicationRefOfFlagToDelete: undefined,
        createFlag: true,
        createFlagUrl: `${serviceUri}/flags?createFlag=true`,
        flagIdToDelete: undefined,
        header: [
          { text: "Agreement number" },
          { text: "SBI" },
          { text: "Note" },
          { text: "Created by" },
          { text: "Created at" },
          { text: "Action" },
        ],
        rows: [
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Tom" },
            { text: "Invalid Date" },
            { html: "</>" },
          ],
        ],
      },
    });
  });

  it("creates the table data from the getAllFlags API call data when a flagId to delete is passed", async () => {
    const result = await createFlagsTableData({
      logger: mockLogger,
      flagIdToDelete: flags[0].id,
      createFlag: false,
      isAdmin: true,
    });

    expect(result).toEqual({
      model: {
        applicationRefOfFlagToDelete: flags[0].applicationReference,
        createFlag: false,
        createFlagUrl: `${serviceUri}/flags?createFlag=true`,
        flagIdToDelete: flags[0].id,
        header: [
          { text: "Agreement number" },
          { text: "SBI" },
          { text: "Note" },
          { text: "Created by" },
          { text: "Created at" },
          { text: "Action" },
        ],
        rows: [
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Tom" },
            { text: "Invalid Date" },
            {
              html: `<a class="govuk-button govuk-button--warning" data-module="govuk-button" href="${serviceUri}/flags?deleteFlag=333c18ef-fb26-4beb-ac87-c483fc886fea">Delete flag</a>`,
            },
          ],
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Ben" },
            { text: "Invalid Date" },
            {
              html: `<a class="govuk-button govuk-button--warning" data-module="govuk-button" href="${serviceUri}/flags?deleteFlag=53dbbc6c-dd14-4d01-be11-ad288cb16b08">Delete flag</a>`,
            },
          ],
        ],
      },
    });
  });
});
