import {
  BIOSECURITY_USEFULNESS_LABELS,
  CHANGES_IN_BIOSECURITY_LABELS,
  COST_OF_CHANGES_LABELS,
  typesOfPoultryToDisplay,
} from "ffc-ahwr-common-library";
import {
  createStatusRow,
  createDateOfVisitRow,
  getAction,
  getVetRows,
} from "./common-claim-rows.js";
import { formattedDateToUk, upperFirstLetter } from "./display-helper.js";
import { buildKeyValueJson } from "./row-helper.js";

export function preparePoultryClaimDisplayRow(data, claimInformation, urlParameters, actions) {
  const { claimStatus, createdAt, herd } = claimInformation;

  const statusActions = getAction(
    actions.updateStatusAction,
    "updateStatus",
    "status",
    "update-status",
    urlParameters,
  );

  const status = createStatusRow(claimStatus, statusActions);

  const claimNumber = buildKeyValueJson("Claim number", urlParameters.claimReference, true);

  const claimDate = buildKeyValueJson("Claim date", formattedDateToUk(createdAt), true);

  const dateOfVisitActions = getAction(
    actions.updateDateOfVisitAction,
    "updateDateOfVisit",
    "date of visit",
    "update-date-of-visit",
    urlParameters,
  );

  const dateOfVisit = createDateOfVisitRow(data?.dateOfVisit, dateOfVisitActions);

  const siteName = buildKeyValueJson("Site name", herd?.name, true);

  const siteCPH = buildKeyValueJson("Site CPH", herd?.cph, true);

  const isSingleSite = buildKeyValueJson(
    "Is this the only site associated with this SBI?",
    upperFirstLetter(herd?.isSingleSite),
    true,
  );

  const typesOfPoultry = buildKeyValueJson(
    "Type of poultry",
    upperFirstLetter(typesOfPoultryToDisplay(data?.typesOfPoultry)),
    true,
  );

  const minimumNumberOfBirds = buildKeyValueJson(
    "Minimum number if birds",
    upperFirstLetter(data?.minimumNumberOfBirds),
    true,
  );

  const vetRows = getVetRows(data, actions, urlParameters);

  const { biosecurity, biosecurityUsefulness, changesInBiosecurity, costOfChanges } =
    createBiosecurityQuestions(data);

  const interview = buildKeyValueJson(
    "Evaluation interview",
    upperFirstLetter(data?.interview),
    true,
  );

  return [
    status,
    claimNumber,
    claimDate,
    dateOfVisit,
    siteName,
    siteCPH,
    isSingleSite,
    typesOfPoultry,
    minimumNumberOfBirds,
    ...vetRows,
    biosecurity,
    biosecurityUsefulness,
    changesInBiosecurity,
    costOfChanges,
    interview,
  ];
}

function createBiosecurityQuestions(data) {
  const biosecurity = buildKeyValueJson(
    "Biosecurity assessment",
    upperFirstLetter(data?.biosecurity),
    true,
  );

  const biosecurityUsefulness = buildKeyValueJson(
    "Biosecurity usefulness",
    BIOSECURITY_USEFULNESS_LABELS[data?.biosecurityUsefulness] ||
      upperFirstLetter(data?.biosecurityUsefulness?.replaceAll("-", " ")),
    true,
  );

  const changesInBiosecurity = buildKeyValueJson(
    "Biosecurity recommended changes",
    CHANGES_IN_BIOSECURITY_LABELS[data?.changesInBiosecurity] ||
      upperFirstLetter(data?.changesInBiosecurity?.replaceAll("-", " ")),
    true,
  );

  const costOfChanges = buildKeyValueJson(
    "Expected cost for biosecurity changes ",
    COST_OF_CHANGES_LABELS[data?.costOfChanges] ||
      upperFirstLetter(data?.costOfChanges?.replaceAll("-", " ")),
    true,
  );
  return { biosecurity, biosecurityUsefulness, changesInBiosecurity, costOfChanges };
}
