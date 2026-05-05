import {
  claimType,
  PIG_GENETIC_SEQUENCING_VALUES,
  TYPE_OF_LIVESTOCK,
} from "ffc-ahwr-common-library";
import { buildKeyValueJson } from "./row-helper.js";
import { formattedDateToUk, upperFirstLetter } from "./display-helper.js";
import { getReviewType } from "./get-review-type.js";
import { getLivestockTypes } from "./get-livestock-types.js";
import { sheepPackages } from "../constants/sheep-test-types.js";
import { getStatusUpdateOptions } from "../routes/utils/get-status-update-options.js";
import { speciesEligibleNumber } from "../constants/species-numbers.js";
import { getHerdRowData } from "./get-herd-row-data.js";
import { createDateOfVisitRow, createStatusRow, createVetNameRow } from "./common-claim-rows.js";

const { BEEF, PIGS, DAIRY, SHEEP } = TYPE_OF_LIVESTOCK;

const returnClaimDetailIfExist = (property, value) => property && value;

const testResultText = "Test result";

const getVaccinationStatusLabel = (vaccinationStatus) => {
  if (vaccinationStatus === "notVaccinated") {
    return "Not vaccinated";
  }

  if (vaccinationStatus === "vaccinated") {
    return "Vaccinated";
  }

  return "N/A";
};

export const getPigTestResultRows = (data, type) => {
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

export function prepareClaimDisplayRows(
  data,
  type,
  claimReference,
  page,
  returnPage,
  updateStatusAction,
  updateDateOfVisitAction,
  updateVetsNameAction,
  updateVetRCVSNumberAction,
  claimStatus,
  createdAt,
  organisation,
  herd,
) {
  const { isBeef, isDairy, isPigs, isSheep } = getLivestockTypes(data?.typeOfLivestock);
  const { isReview, isEndemicsFollowUp } = getReviewType(type);

  const getBiosecurityRow = createBiosecurityRow(data, isEndemicsFollowUp);

  const getSheepDiseasesTestedRow = creatSheepDiseasesTestedRow(data, isEndemicsFollowUp);

  const getAction = (createItems, query, visuallyHiddenText, id) => {
    if (!createItems) {
      return null;
    }

    return {
      items: [
        {
          href: `/view-claim/${claimReference}?${query}=true&page=${page}&returnPage=${returnPage}#${id}`,
          text: "Change",
          visuallyHiddenText,
        },
      ],
    };
  };
  const statusActions = getAction(updateStatusAction, "updateStatus", "status", "update-status");
  const dateOfVisitActions = getAction(
    updateDateOfVisitAction,
    "updateDateOfVisit",
    "date of review",
    "update-date-of-visit",
  );
  const vetRCVSNumberActions = getAction(
    updateVetRCVSNumberAction,
    "updateVetRCVSNumber",
    "RCVS number",
    "update-vet-rcvs-number",
  );
  const statusOptions = getStatusUpdateOptions(claimStatus);

  const dateOfSampling = buildKeyValueJson(
    "Date of sampling",
    data?.dateOfTesting && formattedDateToUk(data?.dateOfTesting),
    true,
  );
  const typeOfLivestock = buildKeyValueJson(
    speciesEligibleNumber[data?.typeOfLivestock],
    upperFirstLetter(data?.speciesNumbers),
    true,
  );

  const vetName = createVetNameRow(
    data?.vetsName,
    updateVetsNameAction,
    claimReference,
    page,
    returnPage,
  );

  const vetRCVSNumber = {
    ...buildKeyValueJson("Vet's RCVS number", data?.vetRCVSNumber, true),
    actions: vetRCVSNumberActions,
  };

  const piHunt = buildKeyValueJson("PI hunt", upperFirstLetter(data?.piHunt), true);
  const laboratoryURN = buildKeyValueJson(
    isBeef || isDairy ? "URN or test certificate" : "URN",
    data?.laboratoryURN,
    true,
  );
  const numberOfOralFluidSamples = buildKeyValueJson(
    "Number of oral fluid samples taken",
    data?.numberOfOralFluidSamples,
    true,
  );
  const numberOfBloodSamples = buildKeyValueJson(
    "Number of blood samples taken",
    data?.numberOfBloodSamples,
    true,
  );
  const numberAnimalsTested = buildKeyValueJson(
    "Number of animals tested",
    data?.numberAnimalsTested,
    true,
  );
  const reviewTestResults = buildKeyValueJson(
    "Review test result",
    upperFirstLetter(data?.reviewTestResults),
    true,
  );
  const testResults = returnClaimDetailIfExist(
    data?.testResults && typeof data?.testResults === "string",
    buildKeyValueJson(
      data?.reviewTestResults ? "Follow-up test result" : testResultText,
      upperFirstLetter(data?.testResults),
      true,
    ),
  );
  const vetVisitsReviewTestResults = buildKeyValueJson(
    "Vet Visits Review Test results",
    upperFirstLetter(data?.vetVisitsReviewTestResults),
    true,
  );
  const diseaseStatus = buildKeyValueJson("Disease status category", data?.diseaseStatus, true);
  const numberOfSamplesTested = buildKeyValueJson(
    "Samples tested",
    data?.numberOfSamplesTested,
    true,
  );
  const herdVaccinationStatus = buildKeyValueJson(
    "Herd vaccination status",
    data?.herdVaccinationStatus ? getVaccinationStatusLabel(data.herdVaccinationStatus) : undefined,
    true,
  );
  const sheepEndemicsPackage = buildKeyValueJson(
    "Sheep health package",
    upperFirstLetter(sheepPackages[data?.sheepEndemicsPackage]?.label),
    true,
  );
  const piHuntRecommendedRow = buildKeyValueJson(
    "Vet recommended PI hunt",
    upperFirstLetter(data?.piHuntRecommended),
    true,
  );
  const piHuntAllAnimalsRow = buildKeyValueJson(
    "PI hunt done on all cattle in herd",
    upperFirstLetter(data?.piHuntAllAnimals),
    true,
  );
  const pigFollowUpTestResultRows = getPigTestResultRows(data, type);

  // There are more common rows than this, but the ordering matters and things get more complicated after these
  const { commonRows, typeOfVisit } = createCommonRows(
    claimStatus,
    statusActions,
    createdAt,
    organisation,
    data,
    isReview,
    dateOfVisitActions,
    herd,
    isSheep,
  );

  const commonCowRows = [
    ...commonRows.slice(0, commonRows.indexOf(typeOfVisit)),
    reviewTestResults,
    ...commonRows.slice(commonRows.indexOf(typeOfVisit)),
  ];

  const beefRows = [
    ...commonCowRows,
    isReview && dateOfSampling,
    typeOfLivestock,
    vetName,
    vetRCVSNumber,
    piHunt,
    piHuntRecommendedRow,
    piHuntAllAnimalsRow,
    isEndemicsFollowUp && dateOfSampling,
    laboratoryURN,
    testResults,
    getBiosecurityRow(),
  ];

  const dairyRows = [
    ...commonCowRows,
    isReview && dateOfSampling,
    typeOfLivestock,
    vetName,
    vetRCVSNumber,
    piHunt,
    piHuntRecommendedRow,
    piHuntAllAnimalsRow,
    isEndemicsFollowUp && dateOfSampling,
    laboratoryURN,
    testResults,
    getBiosecurityRow(),
  ];

  const sheepRows = [
    ...commonRows,
    dateOfSampling,
    typeOfLivestock,
    vetName,
    vetRCVSNumber,
    laboratoryURN,
    numberAnimalsTested,
    testResults,
    vetVisitsReviewTestResults,
    diseaseStatus,
    numberOfSamplesTested,
    herdVaccinationStatus,
    sheepEndemicsPackage,
    getBiosecurityRow(),
    ...getSheepDiseasesTestedRow(),
  ];

  const pigRows = [
    ...commonRows,
    dateOfSampling,
    typeOfLivestock,
    numberOfOralFluidSamples,
    numberOfBloodSamples,
    vetName,
    vetRCVSNumber,
    piHunt,
    numberAnimalsTested,
    reviewTestResults,
    herdVaccinationStatus,
    laboratoryURN,
    numberOfSamplesTested,
    ...pigFollowUpTestResultRows,
    getBiosecurityRow(),
  ];

  const speciesRows = () => {
    switch (true) {
      case isBeef:
        return beefRows;
      case isDairy:
        return dairyRows;
      case isPigs:
        return pigRows;
      case isSheep:
        return sheepRows;
      default:
        return [];
    }
  };

  const rows = [...speciesRows()];
  return { rows, statusOptions };
}

function createCommonRows(
  claimStatus,
  statusActions,
  createdAt,
  organisation,
  data,
  isReview,
  dateOfVisitActions,
  herd,
  isSheep,
) {
  const status = createStatusRow(claimStatus, statusActions);

  const claimDate = buildKeyValueJson("Claim date", formattedDateToUk(createdAt), true);

  const organisationName = buildKeyValueJson(
    "Business name",
    upperFirstLetter(organisation?.name),
    true,
  );

  const livestock = buildKeyValueJson(
    "Livestock",
    upperFirstLetter(
      [PIGS, SHEEP].includes(data?.typeOfLivestock)
        ? data?.typeOfLivestock
        : `${data?.typeOfLivestock} cattle`,
    ),
    true,
  );

  const typeOfVisit = buildKeyValueJson(
    "Type of visit",
    isReview ? "Animal health and welfare review" : "Endemic disease follow-ups",
    true,
  );

  const dateOfVisit = createDateOfVisitRow(data?.dateOfVisit, dateOfVisitActions);

  const herdRowData = getHerdRowData(herd, isSheep);
  return {
    commonRows: [
      status,
      claimDate,
      organisationName,
      livestock,
      typeOfVisit,
      dateOfVisit,
      ...herdRowData,
    ],
    typeOfVisit,
  };
}

function createBiosecurityRow(data, isEndemicsFollowUp) {
  return () =>
    data?.biosecurity &&
    isEndemicsFollowUp &&
    [PIGS, BEEF, DAIRY].includes(data?.typeOfLivestock) &&
    buildKeyValueJson(
      "Biosecurity assessment",
      data?.typeOfLivestock === PIGS
        ? upperFirstLetter(
            `${data?.biosecurity?.biosecurity}, Assessment percentage: ${data?.biosecurity?.assessmentPercentage}%`,
          )
        : upperFirstLetter(data?.biosecurity),
      true,
    );
}

function creatSheepDiseasesTestedRow(data, isEndemicsFollowUp) {
  return () =>
    data?.typeOfLivestock === SHEEP &&
    isEndemicsFollowUp &&
    typeof data.testResults === "object" &&
    data.testResults.length
      ? data.testResults.map((sheepTest, index) => {
          const key = index === 0 ? "Disease or condition test result" : "";
          const relevantSheepPackage = sheepPackages[data?.sheepEndemicsPackage];
          const relevantDiseaseType = relevantSheepPackage.testTypes.find(
            (test) => test.value === sheepTest.diseaseType,
          );
          const value =
            typeof sheepTest.result === "object"
              ? sheepTest.result
                  .map((testResult) => `${testResult.diseaseType} (${testResult.result})</br>`)
                  .join(" ")
              : `${relevantSheepPackage.testTypes.find((test) => test.value === sheepTest.diseaseType)?.text} (${relevantDiseaseType.resultType.find((resultType) => resultType.value === sheepTest.result).text})`;
          return buildKeyValueJson(key, value, true);
        })
      : [];
}
