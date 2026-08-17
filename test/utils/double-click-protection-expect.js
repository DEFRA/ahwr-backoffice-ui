// ahwr-update-form marks the forms that mutate an agreement, claim or flag
export const doubleClickProtectionOk = ($, expectedFormCount) => {
  const protection = $("form.ahwr-update-form button[type='submit']")
    .map((_, button) => $(button).attr("data-prevent-double-click") ?? "unprotected")
    .get();

  expect(protection).toEqual(Array(expectedFormCount).fill("true"));
};
