export const getErrorMessagesByKey = (errors) => {
  const dateFields = new Set(["day", "month", "year", "all"]);
  const dateErrors = [];
  const keyedErrors = errors.reduce((obj, { key, text }) => {
    if (dateFields.has(key)) {
      dateErrors.push(text);
    }
    return {
      ...obj,
      [key]: { text },
    };
  }, {});

  return dateErrors.length > 0
    ? { ...keyedErrors, ...{ visitDate: { text: dateErrors.join(", ") } } }
    : keyedErrors;
};
