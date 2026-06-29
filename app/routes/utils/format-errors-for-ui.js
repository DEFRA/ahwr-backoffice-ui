export const formatErrorsForUI = (joiErrors, href) =>
  joiErrors.map((error) => ({
    text: error.message,
    href,
    key: error.context.key,
  }));
