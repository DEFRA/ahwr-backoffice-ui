import { searchValidation } from "../../app/lib/search-validation.js";

describe("searchValidation", () => {
  test.each([
    { type: "ref", text: "AHWR-5446-5EF4" },
    { type: "ref", text: "IAHW-1234-5678" },
    { type: "ref", text: "iahw-ABCD-1234" },
    { type: "ref", text: "IAHW-ABCD-1234" },
    { type: "ref", text: "POUL-ABCD-1234" },
    { type: "ref", text: "PORE-ABCD-1234" },
    { type: "organisation", text: "IAHW-1234" },
    { type: "organisation", text: "IAHW-ABCD-1234-EFGH" },
    { type: "sbi", text: "107279003" },
    { type: "organisation", text: "a string" },
    { type: "species", text: "sheep" },
    { type: "reset", text: "" },
  ])("A valid $searchType ($text) should return $text and $type as type", ({ type, text }) => {
    const { searchText, searchType } = searchValidation(text);
    expect(searchType).toBe(type);
    expect(searchText).toBe(text);
  });

  describe("retired basic-search terms return 'unsupported'", () => {
    test.each([
      { text: "01/12/2024" },
      { text: "31/12/2025" },
      { text: "01-12-2024" },
      { text: "01.12.2024" },
    ])("a date ($text) is no longer a searchable term", ({ text }) => {
      const { searchText, searchType } = searchValidation(text);
      expect(searchType).toBe("unsupported");
      expect(searchText).toBe(text);
    });

    test.each([
      { status: "agreed" },
      { status: "applied" },
      { status: "withdrawn" },
      { status: "inputted" },
      { status: "claimed" },
      { status: "in check" },
      { status: "check" },
      { status: "recommended" },
      { status: "pay" },
      { status: "recommended to pay" },
      { status: "reject" },
      { status: "recommended to reject" },
      { status: "paid" },
      { status: "rejected" },
      { status: "not agreed" },
      { status: "ready" },
      { status: "ready to pay" },
      { status: "hold" },
      { status: "on hold" },
    ])("a status ($status) is no longer a searchable term", ({ status }) => {
      const { searchText, searchType } = searchValidation(status);
      expect(searchType).toBe("unsupported");
      expect(searchText).toBe(status);
    });
  });
});
