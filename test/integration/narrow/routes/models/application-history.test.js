import { getHistoryDetails } from "../../../../../app/routes/models/application-history.js";
import { config } from "../../../../../app/config/index.js";

jest.mock("../../../../../app/config/index.js", () => ({
  config: require("../../../../helpers/mock-config.js").asConvict({
    withdrawalRequestEnabled: true,
  }),
}));

afterEach(() => {
  config.set("withdrawalRequestEnabled", true);
});

test("renders table", () => {
  const historyRecords = [
    {
      eventType: "status-updated",
      updatedProperty: "status",
      newValue: "RECOMMENDED_TO_PAY",
      note: "We should pay this",
      updatedBy: "Tester, A",
      updatedAt: "2025-03-11T15:07:08.488Z",
    },
    {
      eventType: "application-vetName",
      updatedProperty: "vetName",
      newValue: "Barry Newman",
      oldValue: "Barry Oldman",
      note: "A new Barry",
      updatedBy: "Testing, Bin",
      updatedAt: "2025-03-28T12:00:49.506Z",
    },
    {
      eventType: "application-vetRcvs",
      updatedProperty: "vetRcvs",
      newValue: "1234567",
      oldValue: "7654321",
      note: "Other way round",
      updatedBy: "Test, May",
      updatedAt: "2025-03-28T12:06:37.520Z",
    },
    {
      eventType: "application-visitDate",
      updatedProperty: "visitDate",
      newValue: "2025-03-02T00:00:00.000Z",
      oldValue: "2025-01-03T00:00:00.000Z",
      note: "Oops",
      updatedBy: "Tested, Bin",
      updatedAt: "2025-03-28T14:54:18.927Z",
    },
    {
      eventType: "Agreement flagged (non-Multiple Herds)",
      newValue: "Flagged (non-Multiple Herds)",
      note: "Flag this please",
      oldValue: "Unflagged",
      updatedAt: "2025-03-28T14:54:18.927Z",
      updatedBy: "Tom",
      updatedProperty: "agreementFlag",
    },
    {
      eventType: "claim-herdAssociated",
      newValue: "Sheepies",
      note: "Herd details were retroactively applied to this pre-multiple herds claim",
      oldValue: "Unnamed herd",
      updatedAt: "2025-03-28T14:54:18.927Z",
      updatedBy: "admin",
      updatedProperty: "herdName",
    },
    {
      eventType: "claim-urnResult",
      newValue: "SA-123-345",
      note: "URN was incorrectly entered, and has been updated",
      oldValue: "ZZZXXX",
      updatedAt: "2025-03-28T14:54:18.927Z",
      updatedBy: "admin",
      updatedProperty: "laboratoryUrn",
    },
    {
      eventType: "application-eligiblePiiRedaction",
      newValue: true,
      note: "Eligible PII Redaction was incorrectly entered, and has been updated",
      oldValue: false,
      updatedAt: "2025-03-28T14:54:18.927Z",
      updatedBy: "admin",
      updatedProperty: "eligiblePiiRedaction",
    },
  ];

  const expected = {
    header: [
      { text: "Date" },
      { text: "Time" },
      { text: "Action" },
      { text: "User" },
      { text: "Note", classes: "govuk-!-width-one-quarter" },
    ],
    rows: [
      [
        { text: "11/03/2025" },
        { text: "15:07:08" },
        { text: "Recommended to Pay" },
        { text: "Tester, A" },
        { text: "We should pay this" },
      ],
      [
        { text: "28/03/2025" },
        { text: "12:00:49" },
        { text: "Vet updated from Barry Oldman to Barry Newman" },
        { text: "Testing, Bin" },
        { text: "A new Barry" },
      ],
      [
        { text: "28/03/2025" },
        { text: "12:06:37" },
        { text: "RCVS updated from 7654321 to 1234567" },
        { text: "Test, May" },
        { text: "Other way round" },
      ],
      [
        { text: "28/03/2025" },
        { text: "14:54:18" },
        { text: "Date of review updated from 03/01/2025 to 02/03/2025" },
        { text: "Tested, Bin" },
        { text: "Oops" },
      ],
      [
        { text: "28/03/2025" },
        { text: "14:54:18" },
        {
          text: "Agreement was moved from Unflagged to Flagged (non-Multiple Herds)",
        },
        { text: "Tom" },
        { text: "Flag this please" },
      ],
      [
        {
          text: "28/03/2025",
        },
        {
          text: "14:54:18",
        },
        {
          text: "Herd details were updated from Unnamed herd to Sheepies",
        },
        {
          text: "admin",
        },
        {
          text: "Herd details were retroactively applied to this pre-multiple herds claim",
        },
      ],
      [
        {
          text: "28/03/2025",
        },
        {
          text: "14:54:18",
        },
        {
          text: "Laboratory URN was updated from ZZZXXX to SA-123-345",
        },
        {
          text: "admin",
        },
        {
          text: "URN was incorrectly entered, and has been updated",
        },
      ],
      [
        {
          text: "28/03/2025",
        },
        {
          text: "14:54:18",
        },
        {
          text: "Eligible for automated data redaction updated from false to true",
        },
        {
          text: "admin",
        },
        {
          text: "Eligible PII Redaction was incorrectly entered, and has been updated",
        },
      ],
    ],
  };

  const historyData = getHistoryDetails(historyRecords);

  expect(historyData).toEqual(expected);
});

test("renders withdrawal details as bold-titled lines in the action cell", () => {
  const historyRecords = [
    {
      eventType: "status-updated",
      updatedProperty: "status",
      newValue: "WITHDRAWN",
      note: "Withdrawal requested",
      updatedBy: "Tester, A",
      updatedAt: "2025-03-11T15:07:08.488Z",
      withdrawal: {
        reasonForWithdrawal: "vetSummaryEnteredIncorrectly",
        issueDiscovery: "customerContactedRPA",
        withdrawalDetails: "Date of sample was entered as the date of visit",
      },
    },
  ];

  const historyData = getHistoryDetails(historyRecords);

  expect(historyData.rows[0][2]).toEqual({
    html:
      "Withdrawn<br>" +
      "<strong>Reason for withdrawal:</strong> Data from the vet summary was entered incorrectly<br>" +
      "<strong>How the issue was discovered:</strong> Customer contacted the RPA<br>" +
      "<strong>Enter details for why this claim should be withdrawn:</strong> Date of sample was entered as the date of visit",
  });
});

test("escapes html in the withdrawal details free text", () => {
  const historyRecords = [
    {
      eventType: "status-updated",
      updatedProperty: "status",
      newValue: "WITHDRAWN",
      note: "Withdrawal requested",
      updatedBy: "Tester, A",
      updatedAt: "2025-03-11T15:07:08.488Z",
      withdrawal: {
        reasonForWithdrawal: "unintentionalTypingError",
        issueDiscovery: "evidenceDidNotMatch",
        withdrawalDetails: "<script>alert('x')</script> & more",
      },
    },
  ];

  const historyData = getHistoryDetails(historyRecords);

  expect(historyData.rows[0][2].html).toContain(
    "<strong>Enter details for why this claim should be withdrawn:</strong> " +
      "&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt; &amp; more",
  );
});

test("shows a pending withdrawal request in the change log with its details", () => {
  const historyRecords = [
    {
      eventType: "withdrawal-requested",
      updatedProperty: "withdrawalRequest",
      newValue: "Pending",
      updatedBy: "Tester, A",
      updatedAt: "2025-03-11T15:07:08.488Z",
      withdrawal: {
        reasonForWithdrawal: "unintentionalTypingError",
        issueDiscovery: "customerContactedRPA",
        withdrawalDetails: "Typo in the date",
      },
    },
  ];

  const historyData = getHistoryDetails(historyRecords);

  expect(historyData.rows[0][2]).toEqual({
    html:
      "Withdrawal requested (Pending)<br>" +
      "<strong>Reason for withdrawal:</strong> Data contained an unintentional typing error<br>" +
      "<strong>How the issue was discovered:</strong> Customer contacted the RPA<br>" +
      "<strong>Enter details for why this claim should be withdrawn:</strong> Typo in the date",
  });
});

test("hides the pending withdrawal request from the change log when withdrawalRequestEnabled is off", () => {
  config.set("withdrawalRequestEnabled", false);
  const historyRecords = [
    {
      eventType: "status-updated",
      updatedProperty: "status",
      newValue: "IN_CHECK",
      updatedBy: "Tester, A",
      updatedAt: "2025-03-11T15:00:00.000Z",
    },
    {
      eventType: "withdrawal-requested",
      updatedProperty: "withdrawalRequest",
      newValue: "Pending",
      updatedBy: "Tester, A",
      updatedAt: "2025-03-11T15:07:08.488Z",
      withdrawal: {
        reasonForWithdrawal: "unintentionalTypingError",
        issueDiscovery: "customerContactedRPA",
        withdrawalDetails: "Typo in the date",
      },
    },
  ];

  const { rows } = getHistoryDetails(historyRecords);

  expect(rows).toHaveLength(1);
  expect(JSON.stringify(rows)).not.toContain("Withdrawal requested (Pending)");
});
