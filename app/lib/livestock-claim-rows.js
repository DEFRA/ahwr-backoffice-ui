import { claimType, PIG_GENETIC_SEQUENCING_VALUES } from "ffc-ahwr-common-library";
import { buildKeyValueJson } from "./row-helper";
import { upperFirstLetter } from "./display-helper";

export const getPigTestResultRows = (data, type, testResultText) => {
  if (type === claimType.review) {
    return [
      {
        key: { text: testResultText },
        value: { html: upperFirstLetter(data.testResults) },
      },
    ];
  }

  const testResultType = upperFirstLetter(data.pigsFollowUpTest);
  const testResult = data[`pigs${testResultType}TestResult`];

  const pigTestResultRows = [
    buildKeyValueJson(testResultText, `${testResultType.toUpperCase()} ${testResult}`, true),
  ];

  const geneticSequencing = data?.pigsGeneticSequencing;

  if (geneticSequencing) {
    const geneticSequencingLabel = PIG_GENETIC_SEQUENCING_VALUES.find(
      (keyValuePair) => keyValuePair.value === geneticSequencing,
    ).label;

    pigTestResultRows.push(
      buildKeyValueJson("Genetic sequencing test results", geneticSequencingLabel, true),
    );
  }

  return pigTestResultRows;
};
