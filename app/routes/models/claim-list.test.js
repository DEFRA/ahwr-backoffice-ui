import { getClaimTableHeader, getClaimTableRows } from "./claim-list";

jest.mock("../../config/index.js", () => ({
  config: {
    serviceUri: "test-uri",
  },
}));

describe("Application-list model test", () => {
  test.each([
    { n: 0, field: "claim number", direction: "DESC" },
    { n: 0, field: "claim number", direction: "ASC" },
    { n: 5, field: "SBI", direction: "DESC" },
    { n: 5, field: "SBI", direction: "ASC" },
    { n: 2, field: "species", direction: "DESC" },
    { n: 2, field: "species", direction: "ASC" },
    { n: 6, field: "claim date", direction: "DESC" },
    { n: 6, field: "claim date", direction: "ASC" },
    { n: 7, field: "status", direction: "DESC" },
    { n: 7, field: "status", direction: "ASC" },
  ])("getClaimTableHeader $field $direction", async ({ n, field, direction }) => {
    const sortField = { field, direction };
    const ariaSort = direction === "DESC" ? "descending" : "ascending";
    const res = getClaimTableHeader(sortField);
    expect(res).not.toBeNull();
    expect(res[n].attributes["aria-sort"]).toEqual(ariaSort);
  });
});

describe("Application-list createModel", () => {
  const claims = [
    {
      id: "32ccceb1-038f-4c6b-8ed0-af0cf70af831",
      reference: "AHWR-1111-1111",
      applicationReference: "AHWR-1234-APP1",
      data: {
        vetsName: "asdasd",
        dateOfVisit: "2024-03-22T00:00:00.000Z",
        dateOfTesting: "2024-03-22T00:00:00.000Z",
        laboratoryURN: "123123",
        vetRCVSNumber: "1235671",
        speciesNumbers: "yes",
        typeOfLivestock: "sheep",
        numberAnimalsTested: "123",
      },
      status: "PAID",
      type: "R",
      createdAt: "2024-03-22T12:20:18.307Z",
      updatedAt: "2024-03-22T12:20:18.307Z",
      createdBy: "sql query",
      updatedBy: null,
      application: {
        data: {},
        organisation: {
          sbi: 123456,
        },
        flags: [],
      },
    },
  ];

  const poultryClaim = {
    id: "32ccceb1-038f-4c6b-8ed0-af0cf70af831",
    applicationReference: "POUL-1LZ5-ELVQ",
    reference: "PORE-AGCC-9QH8",
    type: "REVIEW",
    createdBy: "admin",
    data: {
      dateOfVisit: "2025-01-22T00:00:00.000Z",
      typesOfPoultry: ["ducks", "broilers", "laying-hens"],
      minimumNumberOfBirds: "yes",
      vetsName: "Test Vet",
      vetRCVSNumber: "1234567",
      biosecurity: "yes",
      biosecurityUsefulness: "somewhat-useful",
      changesInBiosecurity: "no-recommendation",
      costOfChanges: "no-intention",
      interview: "no",
      amount: 430,
      claimType: "REVIEW",
    },
    status: "IN_CHECK",
    herd: {
      id: "df91f6e5-0cd2-4514-8da5-bcc2fda76120",
      version: 1,
      cph: "12/123/1234",
      name: "Test Site 1",
      associatedAt: "2026-04-30T14:51:16.386Z",
    },
    createdAt: "2026-04-30T14:51:16.409Z",
    statusHistory: [
      {
        status: "IN_CHECK",
        createdBy: "admin",
        createdAt: "2026-04-30T14:51:16.409Z",
      },
    ],
    updateHistory: [],
    updatedAt: "2026-04-30T14:51:16.409Z",
    application: {
      data: {},
      organisation: {
        sbi: 123456,
      },
      flags: [],
    },
  };
  describe("getClaimTableRows livestock", () => {
    test("returns correct claim reference and type", () => {
      const rows = getClaimTableRows(claims, 1, "claim");
      const formattedHtml = rows[0][0].html.replaceAll(/\s+/g, " ");
      expect(formattedHtml).toContain(
        '<a class="govuk-!-margin-0 responsive-text" href="test-uri/view-claim/AHWR-1111-1111?page=1&returnPage=claim">AHWR-1111-1111</a>',
      );
      expect(formattedHtml).toContain('<p class="govuk-!-margin-0 responsive-text">Review</p>');
    });

    test("returns empty flagged indicator when no flags", () => {
      const rows = getClaimTableRows(claims, 1, "claim");
      expect(rows[0][1].html).toBe("");
      expect(rows[0][1].classes).toBe("responsive-text");
    });

    test("returns formatted species", () => {
      const rows = getClaimTableRows(claims, 1, "claim");
      expect(rows[0][2].text).toBe("Sheep");
      expect(rows[0][2].attributes["data-sort-value"]).toBe("sheep");
    });

    test("returns unnamed flock for sheep without herd name", () => {
      const rows = getClaimTableRows(claims, 1, "claim");
      expect(rows[0][3].text).toBe("Unnamed flock");
    });

    test("returns dash for missing herd CPH", () => {
      const rows = getClaimTableRows(claims, 1, "claim");
      expect(rows[0][4].text).toBe("-");
    });

    test("returns SBI number", () => {
      const rows = getClaimTableRows(claims, 1, "claim");
      expect(rows[0][5].text).toBe(123456);
      expect(rows[0][5].attributes["data-sort-value"]).toBe(123456);
    });

    test("returns formatted claim date", () => {
      const rows = getClaimTableRows(claims, 1, "claim");
      expect(rows[0][6].text).toBe("22/03/2024");
      expect(rows[0][6].attributes["data-sort-value"]).toBe("2024-03-22T12:20:18.307Z");
    });

    test("returns formatted status with styling", () => {
      const rows = getClaimTableRows(claims, 1, "claim");
      expect(rows[0][7].html).toContain("govuk-tag");
      expect(rows[0][7].html).toContain("govuk-tag--blue");
      expect(rows[0][7].html).toContain("Paid");
      expect(rows[0][7].attributes["data-sort-value"]).toBe("PAID");
    });
  });

  describe("getClaimTableRows poultry", () => {
    test("returns correct claim reference and type", () => {
      const rows = getClaimTableRows([poultryClaim], 1, "claim");
      const formattedHtml = rows[0][0].html.replaceAll(/\s+/g, " ");
      expect(formattedHtml).toContain(
        '<a class="govuk-!-margin-0 responsive-text" href="test-uri/view-claim/PORE-AGCC-9QH8?page=1&returnPage=claim">PORE-AGCC-9QH8</a>',
      );
      expect(formattedHtml).toContain('<p class="govuk-!-margin-0 responsive-text">Review</p>');
    });

    test("returns empty flagged indicator when no flags", () => {
      const rows = getClaimTableRows([poultryClaim], 1, "claim");
      expect(rows[0][1].html).toBe("");
      expect(rows[0][1].classes).toBe("responsive-text");
    });

    test("returns formatted species", () => {
      const rows = getClaimTableRows([poultryClaim], 1, "claim");
      expect(rows[0][2].text).toBe("Ducks, broilers, laying hens");
      expect(rows[0][2].attributes["data-sort-value"]).toBe("ducks, broilers, laying hens");
    });

    test("returns unnamed flock for sheep without herd name", () => {
      const rows = getClaimTableRows([poultryClaim], 1, "claim");
      expect(rows[0][3].text).toBe("Test Site 1");
    });

    test("returns the herd CPH", () => {
      const rows = getClaimTableRows([poultryClaim], 1, "claim");
      expect(rows[0][4].text).toBe("12/123/1234");
    });

    test("returns dash for missing herd CPH", () => {
      const rows = getClaimTableRows(
        [{ ...poultryClaim, herd: { ...poultryClaim.herd, cph: null } }],
        1,
        "claim",
      );
      expect(rows[0][4].text).toBe("-");
    });

    test("returns SBI number", () => {
      const rows = getClaimTableRows([poultryClaim], 1, "claim");
      expect(rows[0][5].text).toBe(123456);
      expect(rows[0][5].attributes["data-sort-value"]).toBe(123456);
    });

    test("returns formatted claim date", () => {
      const rows = getClaimTableRows([poultryClaim], 1, "claim");
      expect(rows[0][6].text).toBe("30/04/2026");
      expect(rows[0][6].attributes["data-sort-value"]).toBe("2026-04-30T14:51:16.409Z");
    });

    test("returns formatted status with styling", () => {
      const rows = getClaimTableRows([poultryClaim], 1, "claim");
      expect(rows[0][7].html).toContain("govuk-tag");
      expect(rows[0][7].html).toContain("govuk-tag--orange");
      expect(rows[0][7].html).toContain("In check");
      expect(rows[0][7].attributes["data-sort-value"]).toBe("IN_CHECK");
    });
  });

  test("getClaimTableRows with a flagged claim", async () => {
    const page = 1;
    const returnPage = "claim";
    const flaggedClaims = [
      { ...claims[0], application: { ...claims[0].application, flags: [{ appliesToMh: true }] } },
    ];
    const rows = getClaimTableRows(flaggedClaims, page, returnPage);

    const formattedRows = rows[0][0].html.replaceAll(/\s+/g, " ");
    expect(formattedRows).toContain(
      '<a class="govuk-!-margin-0 responsive-text" href="test-uri/view-claim/AHWR-1111-1111?page=1&returnPage=claim">AHWR-1111-1111</a>',
    );
    expect(formattedRows).toContain('<p class="govuk-!-margin-0 responsive-text">Review</p>');
  });

  test("getClaimTableRows with a claim missing flags info", async () => {
    const page = 1;
    const returnPage = "claim";
    const flaggedClaims = [{ ...claims[0], application: { ...claims[0].application } }];
    const rows = getClaimTableRows(flaggedClaims, page, returnPage);

    const formattedRows = rows[0][0].html.replaceAll(/\s+/g, " ");
    expect(formattedRows).toContain(
      '<a class="govuk-!-margin-0 responsive-text" href="test-uri/view-claim/AHWR-1111-1111?page=1&returnPage=claim">AHWR-1111-1111</a>',
    );
    expect(formattedRows).toContain('<p class="govuk-!-margin-0 responsive-text">Review</p>');
  });

  test("getClaimTableRows showSBI false", async () => {
    const page = 1;
    const returnPage = "claim";
    const showSBI = false;
    const rows = getClaimTableRows(claims, page, returnPage, showSBI);
    const formattedRows = rows[0][0].html.replaceAll(/\s+/g, " ");
    expect(formattedRows).toContain(
      '<a class="govuk-!-margin-0 responsive-text" href="test-uri/view-claim/AHWR-1111-1111?page=1&returnPage=claim">AHWR-1111-1111</a>',
    );
    expect(formattedRows).toContain('<p class="govuk-!-margin-0 responsive-text">Review</p>');
  });
});
