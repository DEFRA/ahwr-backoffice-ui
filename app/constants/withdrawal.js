// The single source of truth for the withdrawal reason and issue-discovery options.
// Used both to build the radios on withdrawal-claim.njk and to label them on the
// claim history tab (application-history.js), so the two never drift apart.

export const WITHDRAWAL_REASONS = [
  {
    value: "vetSummaryEnteredIncorrectly",
    text: "Data from the vet summary was entered incorrectly",
    hint: { text: "For example, date of sample instead of date of visit" },
  },
  {
    value: "differentClaimEntered",
    text: "Data from a different claim was entered",
    hint: { text: "For example, information from a follow-up instead of a review" },
  },
  {
    value: "unintentionalTypingError",
    text: "Data contained an unintentional typing error",
    hint: { text: "For example, a spelling mistake or incorrect number" },
  },
  {
    value: "incorrectSelectionInService",
    text: "Incorrect selection was made in the digital service",
    hint: { text: "For example, yes instead of no" },
  },
  {
    value: "confusingInformationFromVet",
    text: "Incorrect or confusing information was given by vet",
    hint: { text: "For example, the wrong box completed in the summary template" },
  },
];

export const WITHDRAWAL_ISSUE_DISCOVERIES = [
  { value: "customerContactedRPA", text: "Customer contacted the RPA" },
  { value: "evidenceDidNotMatch", text: "Evidence did not match customer's data" },
];

export const labelsByValue = (items) =>
  Object.fromEntries(items.map(({ value, text }) => [value, text]));
