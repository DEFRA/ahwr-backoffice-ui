import { getPigTestResultRows } from "./livestock-claim-rows";

const claims = [
  {
    id: "58b297c9-c983-475c-8bdb-db5746899cec",
    reference: "REPI-1111-6666",
    applicationReference: "IAHW-1234-APP1",
    data: {
      claimType: "R",
      typeOfLivestock: "pigs",
      vetsName: "Vet one",
      dateOfVisit: "2024-03-22T00:00:00.000Z",
      dateOfTesting: "2024-03-22T00:00:00.000Z",
      vetRCVSNumber: "1233211",
      laboratoryURN: "123456",
      speciesNumbers: "yes",
      numberOfOralFluidSamples: "6",
      numberAnimalsTested: "40",
      testResults: "positive",
    },
    type: "REVIEW",
    createdAt: "2024-03-25T12:20:18.307Z",
    updatedAt: "2024-03-25T12:20:18.307Z",
    createdBy: "sql query",
    updatedBy: null,
    status: "PAID",
    statusHistory: [
      {
        createdAt: "2024-03-25T12:20:18.307Z",
        status: "IN_CHECK",
        createdBy: "admin",
      },
      {
        createdAt: "2024-03-26T12:20:18.307Z",
        status: "RECOMMENDED_TO_PAY",
        createdBy: "Jim Junior",
      },
      {
        createdAt: "2024-03-27T12:20:18.307Z",
        status: "READY_TO_PAY",
        createdBy: "Jim Senior",
      },
      {
        createdAt: "2024-03-28T12:20:18.307Z",
        status: "PAID",
        createdBy: "admin",
      },
    ],
  },
  {
    id: "5e8558ee-31d7-454b-a061-b8c97bb91d56",
    reference: "FUSH-0000-4444",
    applicationReference: "IAHW-1234-APP1",
    data: {
      vetsName: "12312312312sdfsdf",
      dateOfVisit: "2024-03-22T00:00:00.000Z",
      dateOfTesting: "2024-03-22T00:00:00.000Z",
      vetRCVSNumber: "1233211",
      speciesNumbers: "yes",
      typeOfLivestock: "sheep",
      laboratoryURN: "123456",
      numberAnimalsTested: "40",
      sheepEndemicsPackage: "reducedLameness",
      testResults: [
        {
          result: "clinicalSymptomsPresent",
          diseaseType: "heelOrToeAbscess",
        },
        {
          result: "clinicalSymptomsNotPresent",
          diseaseType: "shellyHoof",
        },
        {
          result: "clinicalSymptomsPresent",
          diseaseType: "tickPyaemia",
        },
        {
          result: [
            {
              result: "123",
              diseaseType: "yyyyy",
            },
            {
              result: "ccc",
              diseaseType: "bbbb",
            },
          ],
          diseaseType: "other",
        },
      ],
    },
    type: "FOLLOW_UP",
    createdAt: "2024-03-20T12:20:18.307Z",
    updatedAt: "2024-03-20T12:20:18.307Z",
    createdBy: "sql query",
    updatedBy: null,
    status: "RECOMMENDED_TO_PAY",
    statusHistory: [
      {
        createdAt: "2024-03-25T12:20:18.307Z",
        status: "IN_CHECK",
        createdBy: "admin",
      },
      {
        createdAt: "2024-03-26T12:20:18.307Z",
        status: "RECOMMENDED_TO_PAY",
        createdBy: "Jim Junior",
      },
    ],
  },
  {
    id: "58b297c9-c983-475c-8bdb-db5746899cec",
    reference: "FUPI-1111-6666",
    applicationReference: "IAHW-1234-APP1",
    data: {
      claimType: "E",
      vetsName: "12312312312sdfsdf",
      biosecurity: {
        biosecurity: "yes",
        assessmentPercentage: "100",
      },
      dateOfVisit: "2024-03-22T00:00:00.000Z",
      dateOfTesting: "2024-03-22T00:00:00.000Z",
      vetRCVSNumber: "1233211",
      speciesNumbers: "yes",
      typeOfLivestock: "pigs",
      numberOfSamplesTested: "6",
      numberAnimalsTested: "40",
      herdVaccinationStatus: "vaccinated",
      diseaseStatus: "4",
      laboratoryURN: "123456",
      reviewTestResults: "positive",
      vetVisitsReviewTestResults: "positive",
    },
    type: "FOLLOW_UP",
    createdAt: "2024-03-25T12:20:18.307Z",
    updatedAt: "2024-03-25T12:20:18.307Z",
    createdBy: "sql query",
    updatedBy: null,
    status: "PAID",
    statusHistory: [
      {
        createdAt: "2024-03-25T12:20:18.307Z",
        status: "IN_CHECK",
        createdBy: "admin",
      },
      {
        createdAt: "2024-03-26T12:20:18.307Z",
        status: "RECOMMENDED_TO_PAY",
        createdBy: "Jim Junior",
      },
      {
        createdAt: "2024-03-27T12:20:18.307Z",
        status: "READY_TO_PAY",
        createdBy: "Jim Senior",
      },
      {
        createdAt: "2024-03-28T12:20:18.307Z",
        status: "PAID",
        createdBy: "admin",
      },
    ],
  },
  {
    id: "58b297c9-c983-475c-8bdb-db5746899cec",
    reference: "FUBC-1111-6666",
    applicationReference: "IAHW-1234-APP1",
    data: {
      vetsName: "12312312312sdfsdf",
      biosecurity: "no",
      dateOfVisit: "2024-03-22T00:00:00.000Z",
      dateOfTesting: "2024-03-22T00:00:00.000Z",
      vetRCVSNumber: "1233211",
      speciesNumbers: "yes",
      typeOfLivestock: "beef",
      numberOfSamplesTested: "6",
      numberAnimalsTested: "40",
      laboratoryURN: "123456",
      vetVisitsReviewTestResults: "positive",
      testResults: "positive",
      reviewTestResults: "positive",
    },
    type: "FOLLOW_UP",
    createdAt: "2024-03-25T12:20:18.307Z",
    updatedAt: "2024-03-25T12:20:18.307Z",
    createdBy: "sql query",
    updatedBy: null,
    status: "PAID",
    statusHistory: [
      {
        createdAt: "2024-03-25T12:20:18.307Z",
        status: "IN_CHECK",
        createdBy: "admin",
      },
      {
        createdAt: "2024-03-26T12:20:18.307Z",
        status: "RECOMMENDED_TO_PAY",
        createdBy: "Jim Junior",
      },
      {
        createdAt: "2024-03-27T12:20:18.307Z",
        status: "READY_TO_PAY",
        createdBy: "Jim Senior",
      },
      {
        createdAt: "2024-03-28T12:20:18.307Z",
        status: "PAID",
        createdBy: "admin",
      },
    ],
  },
];

const pigFollowUpClaimElisa = {
  id: "58b297c9-c983-475c-8bdb-db5746899cec",
  reference: "FUPI-1111-6666",
  applicationReference: "AHWR-1234-APP1",
  data: {
    amount: 923,
    herdId: "d6242c45-20df-4c69-bf49-a213604dd254",
    vetsName: "Tim",
    claimType: "E",
    biosecurity: {
      biosecurity: "yes",
      assessmentPercentage: "30",
    },
    dateOfVisit: "2025-07-30T00:00:00.000Z",
    herdVersion: 1,
    dateOfTesting: "2025-07-30T00:00:00.000Z",
    laboratoryURN: "22222",
    vetRCVSNumber: "1112223",
    speciesNumbers: "yes",
    typeOfLivestock: "pigs",
    herdAssociatedAt: "2025-07-30T09:50:09.258Z",
    pigsFollowUpTest: "elisa",
    reviewTestResults: "negative",
    numberAnimalsTested: "30",
    pigsElisaTestResult: "positive",
    herdVaccinationStatus: "notVaccinated",
    numberOfSamplesTested: "30",
  },
  type: "FOLLOW_UP",
  createdAt: "2024-03-25T12:20:18.307Z",
  updatedAt: "2024-03-25T12:20:18.307Z",
  createdBy: "sql query",
  updatedBy: null,
  status: "PAID",
  statusHistory: [
    {
      createdAt: "2024-03-25T12:20:18.307Z",
      status: "IN_CHECK",
      createdBy: "admin",
    },
    {
      createdAt: "2024-03-26T12:20:18.307Z",
      status: "RECOMMENDED_TO_PAY",
      createdBy: "Jim Junior",
    },
    {
      createdAt: "2024-03-27T12:20:18.307Z",
      status: "READY_TO_PAY",
      createdBy: "Jim Senior",
    },
    {
      createdAt: "2024-03-28T12:20:18.307Z",
      status: "PAID",
      createdBy: "admin",
    },
  ],
};

describe("getPigTestResultRows", () => {
  it("returns the review test result when the claim is a review", () => {
    const result = getPigTestResultRows(claims[0].data, claims[0].type, "Test result");

    expect(result).toEqual([{ key: { text: "Test result" }, value: { html: "Positive" } }]);
  });

  it("returns the ELISA positive when the claim is a follow up", () => {
    const result = getPigTestResultRows(
      pigFollowUpClaimElisa.data,
      pigFollowUpClaimElisa.type,
      "Test result",
    );

    expect(result).toEqual([{ key: { text: "Test result" }, value: { html: "ELISA positive" } }]);
  });

  it("returns the PCR positive when the claim is a follow up", () => {
    const pigsFollowUpPcr = {
      ...pigFollowUpClaimElisa,
      data: {
        ...pigFollowUpClaimElisa,
        pigsFollowUpTest: "pcr",
        pigsPcrTestResult: "positive",
        pigsGeneticSequencing: "mlv",
      },
    };
    const result = getPigTestResultRows(pigsFollowUpPcr.data, pigsFollowUpPcr.data, "Test result");

    expect(result).toEqual([
      { key: { text: "Test result" }, value: { html: "PCR positive" } },
      {
        key: { text: "Genetic sequencing test results" },
        value: { html: "Modified Live virus (MLV) only" },
      },
    ]);
  });
});
