export const buildKeyValueJson = (keyText, valueText, valueAsHtml = false) => {
  if (valueAsHtml) {
    return {
      key: { text: keyText },
      value: { html: valueText },
    };
  }

  return {
    key: { text: keyText },
    value: { text: valueText },
  };
};
