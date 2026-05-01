import * as cheerio from "cheerio";
import { axe } from "../../../helpers/axe-helper.js";
import { getClaim, getClaimHistory, getClaims } from "../../../../app/api/claims";
import { permissions } from "../../../../app/auth/permissions";
import { getApplication } from "../../../../app/api/applications";
import { createServer } from "../../../../app/server";
import { StatusCodes } from "http-status-codes";
import { getClaimViewStates } from "../../../../app/routes/utils/get-claim-view-states";
const { administrator } = permissions;

jest.mock("../../../../app/routes/utils/get-claim-view-states");
jest.mock("../../../../app/auth");
jest.mock("../../../../app/session");
jest.mock("../../../../app/api/claims");
jest.mock("../../../../app/api/applications");
jest.mock("@hapi/wreck", () => ({
  get: jest.fn().mockResolvedValue({ payload: [] }),
}));

describe("View claim test", () => {
  const url = "/view-claim";
  const auth = {
    strategy: "session-auth",
    credentials: { scope: [administrator], account: { username: "test" } },
  };
  const application = {
    id: "787b407f-29da-4d75-889f-1c614d47e87e",
    reference: "IAHW-1234-APP1",
    data: {
      type: "EE",
      reference: null,
      declaration: true,
      offerStatus: "accepted",
      confirmCheckDetails: "yes",
    },
    organisation: {
      sbi: "113494460",
      name: "Test Farm Lodge",
      email: "russelldaviese@seivadllessurm.com.test",
      orgEmail: "orgEmail@gmail.com",
      address:
        "Tesco Stores Ltd,Harwell,Betton,WHITE HOUSE FARM,VINCENT CLOSE,LEIGHTON BUZZARD,HR2 8AN,United Kingdom",
      userType: "newUser",
      farmerName: "Russell Paul Davies",
    },
    claimed: false,
    createdAt: "2024-03-22T12:19:04.696Z",
    updatedAt: "2024-03-22T12:19:04.696Z",
    createdBy: "sql query",
    updatedBy: null,
    type: "EE",
    status: "AGREED",
    flags: [],
    redacted: false,
  };
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

  afterEach(async () => {
    jest.clearAllMocks();
  });

  let server;

  beforeAll(async () => {
    jest.clearAllMocks();
    server = await createServer();

    getClaimViewStates.mockReturnValue({
      moveToInCheckAction: false,
      moveToInCheckForm: false,
      recommendAction: false,
      recommendToPayForm: false,
      recommendToRejectForm: false,
      authoriseAction: false,
      authoriseForm: false,
      rejectAction: false,
      rejectForm: false,
      updateStatusAction: false,
      updateStatusForm: false,
      updateVetsNameAction: false,
      updateVetsNameForm: false,
      updateVetRCVSNumberAction: false,
      updateVetRCVSNumberForm: false,
      updateDateOfVisitAction: false,
      updateDateOfVisitForm: false,
    });

    getClaimHistory.mockResolvedValue({ historyRecords: [] });
  });

  describe(`GET ${url} route`, () => {
    test("returns 302 no auth", async () => {
      const options = {
        method: "GET",
        url: `${url}/123`,
      };
      const res = await server.inject(options);
      expect(res.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("returns 200 with review claim type and Pigs species", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      getClaim.mockReturnValue(claims[0]);
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();

      const expectedContent = [
        { key: "Agreement number", value: "IAHW-1234-APP1" },
        { key: "Agreement date", value: "22/03/2024" },
        { key: "Agreement holder", value: "Russell Paul Davies" },
        {
          key: "Agreement holder email",
          value: "russelldaviese@seivadllessurm.com.test",
        },
        { key: "SBI number", value: "113494460" },
        {
          key: "Address",
          value:
            "Tesco Stores Ltd, Harwell, Betton, WHITE HOUSE FARM, VINCENT CLOSE, LEIGHTON BUZZARD, HR2 8AN, United Kingdom",
        },
        { key: "Business email", value: "orgEmail@gmail.com" },
        { key: "Flagged", value: "No" },
        { key: "Status", value: "Paid" },
        { key: "Claim date", value: "25/03/2024" },
        { key: "Business name", value: "Test Farm Lodge" },
        { key: "Livestock", value: "Pigs" },
        { key: "Type of visit", value: "Animal health and welfare review" },
        { key: "Date of visit", value: "22/03/2024" },
        { key: "Date of sampling", value: "22/03/2024" },
        { key: "51 or more pigs", value: "Yes" },
        { key: "Number of oral fluid samples taken", value: "6" },
        { key: "Vet's name", value: "Vet one" },
        { key: "Vet's RCVS number", value: "1233211" },
        { key: "Number of animals tested", value: "40" },
        { key: "URN", value: "123456" },
        { key: "Test result", value: "Positive" },
      ];
      // Summary list rows expect
      expect($(".govuk-summary-list__row").length).toEqual(31);
      // Application summary details expects
      for (const expected of expectedContent) {
        expect($(".govuk-summary-list__key").text()).toMatch(expected.key);
        expect($(".govuk-summary-list__value").text()).toMatch(expected.value);
      }
    });
    test("returns 200 with endemics claim and sheep species", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      getClaim.mockReturnValue(claims[1]);
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);
      getClaimViewStates.mockReturnValue({
        moveToInCheckAction: false,
        moveToInCheckForm: false,
        recommendAction: false,
        recommendToPayForm: false,
        recommendToRejectForm: false,
        authoriseAction: false,
        authoriseForm: false,
        rejectAction: false,
        rejectForm: false,
        updateStatusAction: true,
        updateStatusForm: true,
        updateVetsNameAction: true,
        updateVetsNameForm: true,
        updateVetRCVSNumberAction: true,
        updateVetRCVSNumberForm: true,
        updateDateOfVisitAction: true,
        updateDateOfVisitForm: true,
      });

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();

      const expectedContent = [
        { key: "Flagged", value: "No" },
        { key: "Status", value: "Recommended to pay", actions: true },
        { key: "Claim date", value: "20/03/2024" },
        { key: "Business name", value: "Test Farm Lodge" },
        { key: "Livestock", value: "Sheep" },
        { key: "Type of visit", value: "Endemic disease follow-ups" },
        { key: "Date of visit", value: "22/03/2024", actions: true },
        { key: "Date of sampling", value: "22/03/2024" },
        { key: "21 or more sheep", value: "Yes" },
        { key: "Vet's name", value: "12312312312sdfsdf", actions: true },
        { key: "Vet's RCVS number", value: "1233211", actions: true },
        { key: "URN", value: "123456" },
        { key: "Number of animals tested", value: "40" },
        { key: "Sheep health package", value: "Lameness" },
        {
          key: "Disease or condition test result",
          value: "Heel or toe abscess (Clinical symptoms present)",
        },
        { key: "", value: "Shelly hoof (Clinical symptoms not present)" },
        { key: "", value: "Tick pyaemia (Clinical symptoms present)" },
        { key: "", value: "yyyyy (123) bbbb (ccc)" },
      ];

      // Summary list rows expect
      expect($(".govuk-summary-list__row").length).toEqual(34);
      // Claim summary details expected
      for (const expected of expectedContent) {
        expect($(".govuk-summary-list__key").text()).toMatch(expected.key);
        expect($(".govuk-summary-list__value").text()).toMatch(expected.value);
        if (expected.actions) {
          expect($(".govuk-summary-list__actions a").text()).toMatch("Change");
        }
      }
    });

    test("should not show actions when agreement is redacted and has permissions", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };
      getClaim.mockReturnValue(claims[1]);
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue({ ...application, redacted: true });
      getClaimViewStates.mockReturnValue({
        moveToInCheckAction: false,
        moveToInCheckForm: false,
        recommendAction: false,
        recommendToPayForm: false,
        recommendToRejectForm: false,
        authoriseAction: false,
        authoriseForm: false,
        rejectAction: false,
        rejectForm: false,
        updateStatusAction: true,
        updateStatusForm: true,
        updateVetsNameAction: true,
        updateVetsNameForm: true,
        updateVetRCVSNumberAction: true,
        updateVetRCVSNumberForm: true,
        updateDateOfVisitAction: true,
        updateDateOfVisitForm: true,
      });

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      expect($(".govuk-summary-list__row").length).toEqual(34);
      expect($(".govuk-summary-list__actions").length).toEqual(0);
    });

    test("the back link should go to agreement details if the user is coming from agreement details page", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444?returnPage=agreement`,
        auth,
      };

      getClaim.mockReturnValue(claims[0]);
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      expect($(".govuk-back-link").attr("href")).toEqual("/agreement/IAHW-1234-APP1/claims");
    });
    test("the back link should go to all claims main tab if the user is coming from all claims main tab", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      getClaim.mockReturnValue(claims[0]);
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();
      expect($(".govuk-back-link").attr("href")).toEqual("/claims?page=1");
    });

    test("Returns 200 for pigs", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      const herd = {
        herdId: "d6242c45-20df-4c69-bf49-a213604dd254",
        herdVersion: 1,
        herdName: "Fattening herd",
        cph: "22/333/4444",
        herdReasons: ["onlyHerd"],
        species: "pigs",
      };

      getClaim.mockReturnValue({
        ...pigFollowUpClaimElisa,
        herd,
      });
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
    });

    test("Returns 200 pigs for a follow up", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      const herd = {
        herdId: "749908bc-072c-462b-a004-79bff170cbba",
        herdVersion: 1,
        herdName: "Fattening herd",
        cph: "22/333/4444",
        herdReasons: ["onlyHerd"],
        species: "pigs",
      };

      getClaim.mockReturnValue({
        ...claims[0],
        herd,
      });
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
    });

    test("Returns 200 with no herd in claim", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      getClaim.mockReturnValue(claims[0]);
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
    });

    test("Returns 200 for sheep", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      const herd = {
        herdId: "749908bc-072c-462b-a004-79bff170cbba",
        herdVersion: 1,
        herdName: "Fattening herd",
        cph: "22/333/4444",
        herdReasons: ["onlyHerd"],
        species: "sheep",
      };

      getClaim.mockReturnValue({
        ...claims[0],
        data: { ...claims[0].data, typeOfLivestock: "sheep" },
        herd,
      });
      getClaims.mockReturnValue({ claims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);

      expect(res.statusCode).toBe(StatusCodes.OK);
    });

    it("should hide oral fluid and show blood samples for pigs review when blood tests taken", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      const pigsReviewWithBloodSamples = claims[0];
      delete pigsReviewWithBloodSamples.data.numberOfOralFluidSamples;
      pigsReviewWithBloodSamples.data.numberOfBloodSamples = "30";
      const updatedClaims = claims;
      updatedClaims[0] = pigsReviewWithBloodSamples;

      getClaim.mockReturnValue(pigsReviewWithBloodSamples);
      getClaims.mockReturnValue({ claims: updatedClaims });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(await axe(res.payload)).toHaveNoViolations();

      const expectedContent = [
        { key: "Agreement number", value: "IAHW-1234-APP1" },
        { key: "Agreement date", value: "22/03/2024" },
        { key: "Agreement holder", value: "Russell Paul Davies" },
        {
          key: "Agreement holder email",
          value: "russelldaviese@seivadllessurm.com.test",
        },
        { key: "SBI number", value: "113494460" },
        {
          key: "Address",
          value:
            "Tesco Stores Ltd, Harwell, Betton, WHITE HOUSE FARM, VINCENT CLOSE, LEIGHTON BUZZARD, HR2 8AN, United Kingdom",
        },
        { key: "Business email", value: "orgEmail@gmail.com" },
        { key: "Flagged", value: "No" },
        { key: "Status", value: "Paid" },
        { key: "Claim date", value: "25/03/2024" },
        { key: "Business name", value: "Test Farm Lodge" },
        { key: "Livestock", value: "Pigs" },
        { key: "Type of visit", value: "Animal health and welfare review" },
        { key: "Date of visit", value: "22/03/2024" },
        { key: "Date of sampling", value: "22/03/2024" },
        { key: "51 or more pigs", value: "Yes" },
        { key: "Number of blood samples taken", value: "30" },
        { key: "Vet's name", value: "Vet one" },
        { key: "Vet's RCVS number", value: "1233211" },
        { key: "Number of animals tested", value: "40" },
        { key: "URN", value: "123456" },
        { key: "Test result", value: "Positive" },
      ];
      // Summary list rows expect
      expect($(".govuk-summary-list__row").length).toEqual(31);
      // Application summary details expects
      for (const expected of expectedContent) {
        expect($(".govuk-summary-list__key").text()).toMatch(expected.key);
        expect($(".govuk-summary-list__value").text()).toMatch(expected.value);
      }
    });
  });

  describe("herd breakdown display", () => {
    test("displays herd breakdown section with correct counts when claims have herds", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      const claimsWithHerds = [
        {
          ...claims[0],
          data: { ...claims[0].data, typeOfLivestock: "beef" },
          herd: { id: "herd-beef-1" },
        },
        {
          ...claims[0],
          data: { ...claims[0].data, typeOfLivestock: "beef" },
          herd: { id: "herd-beef-2" },
        },
        {
          ...claims[0],
          data: { ...claims[0].data, typeOfLivestock: "dairy" },
          herd: { id: "herd-dairy-1" },
        },
        {
          ...claims[0],
          data: { ...claims[0].data, typeOfLivestock: "sheep" },
          herd: { id: "herd-sheep-1" },
        },
        {
          ...claims[0],
          data: { ...claims[0].data, typeOfLivestock: "pigs" },
          herd: { id: "herd-pigs-1" },
        },
        {
          ...claims[0],
          data: { ...claims[0].data, typeOfLivestock: "pigs" },
          herd: { id: "herd-pigs-2" },
        },
        {
          ...claims[0],
          data: { ...claims[0].data, typeOfLivestock: "pigs" },
          herd: { id: "herd-pigs-3" },
        },
      ];

      getClaim.mockReturnValue(claims[0]);
      getClaims.mockReturnValue({ claims: claimsWithHerds });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      // Check for "Number of herds and flocks" label
      expect($(".govuk-summary-list__key").text()).toContain("Number of herds and flocks");

      // Check for species labels and their counts
      expect($(".govuk-summary-list__key").text()).toContain("Beef cattle");
      expect($(".govuk-summary-list__key").text()).toContain("Dairy cattle");
      expect($(".govuk-summary-list__key").text()).toContain("Sheep");
      expect($(".govuk-summary-list__key").text()).toContain("Pigs");

      // Get the nested summary list that contains herd breakdown
      const herdBreakdownRows = $(
        ".govuk-summary-list .govuk-summary-list .govuk-summary-list__row",
      );

      // Extract the values for each species
      const beefRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Beef cattle"),
      );
      const dairyRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Dairy cattle"),
      );
      const sheepRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Sheep"),
      );
      const pigsRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Pigs"),
      );

      expect(beefRow.find(".govuk-summary-list__value").text().trim()).toBe("2");
      expect(dairyRow.find(".govuk-summary-list__value").text().trim()).toBe("1");
      expect(sheepRow.find(".govuk-summary-list__value").text().trim()).toBe("1");
      expect(pigsRow.find(".govuk-summary-list__value").text().trim()).toBe("3");
    });

    test("displays herd breakdown with zero counts when no claims have herds of that species", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      const claimsWithSingleHerd = [
        {
          ...claims[0],
          data: { ...claims[0].data, typeOfLivestock: "pigs" },
          herd: { id: "herd-pigs-1" },
        },
      ];

      getClaim.mockReturnValue(claims[0]);
      getClaims.mockReturnValue({ claims: claimsWithSingleHerd });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const herdBreakdownRows = $(
        ".govuk-summary-list .govuk-summary-list .govuk-summary-list__row",
      );

      const beefRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Beef cattle"),
      );
      const dairyRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Dairy cattle"),
      );
      const sheepRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Sheep"),
      );
      const pigsRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Pigs"),
      );

      expect(beefRow.find(".govuk-summary-list__value").text().trim()).toBe("0");
      expect(dairyRow.find(".govuk-summary-list__value").text().trim()).toBe("0");
      expect(sheepRow.find(".govuk-summary-list__value").text().trim()).toBe("0");
      expect(pigsRow.find(".govuk-summary-list__value").text().trim()).toBe("1");
    });

    test("counts claims without herd id once per species", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      const claimsWithoutHerds = [
        {
          ...claims[0],
          data: { ...claims[0].data, typeOfLivestock: "beef" },
        },
        {
          ...claims[0],
          data: { ...claims[0].data, typeOfLivestock: "beef" },
        },
        {
          ...claims[0],
          data: { ...claims[0].data, typeOfLivestock: "dairy" },
        },
      ];

      getClaim.mockReturnValue(claims[0]);
      getClaims.mockReturnValue({ claims: claimsWithoutHerds });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const herdBreakdownRows = $(
        ".govuk-summary-list .govuk-summary-list .govuk-summary-list__row",
      );

      const beefRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Beef cattle"),
      );
      const dairyRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Dairy cattle"),
      );

      // Multiple beef claims without herd id should only count as 1
      expect(beefRow.find(".govuk-summary-list__value").text().trim()).toBe("1");
      expect(dairyRow.find(".govuk-summary-list__value").text().trim()).toBe("1");
    });

    test("does not double count the same herd id", async () => {
      const options = {
        method: "GET",
        url: `${url}/AHWR-0000-4444`,
        auth,
      };

      const claimsWithDuplicateHerds = [
        {
          ...claims[0],
          data: { ...claims[0].data, typeOfLivestock: "sheep" },
          herd: { id: "herd-sheep-same" },
        },
        {
          ...claims[0],
          data: { ...claims[0].data, typeOfLivestock: "sheep" },
          herd: { id: "herd-sheep-same" },
        },
        {
          ...claims[0],
          data: { ...claims[0].data, typeOfLivestock: "sheep" },
          herd: { id: "herd-sheep-same" },
        },
      ];

      getClaim.mockReturnValue(claims[0]);
      getClaims.mockReturnValue({ claims: claimsWithDuplicateHerds });
      getApplication.mockReturnValue(application);

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const herdBreakdownRows = $(
        ".govuk-summary-list .govuk-summary-list .govuk-summary-list__row",
      );

      const sheepRow = herdBreakdownRows.filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Sheep"),
      );

      // Same herd id used 3 times should only count as 1
      expect(sheepRow.find(".govuk-summary-list__value").text().trim()).toBe("1");
    });
  });

  describe("poultry site breakdown display", () => {
    const poultryApplication = {
      ...application,
      reference: "POUL-1234-APP1",
    };

    const poultryClaim = {
      id: "58b297c9-c983-475c-8bdb-db5746899cec",
      reference: "PORE-1111-6666",
      applicationReference: "POUL-1234-APP1",
      data: {
        typesOfPoultry: ["ducks", "geese"],
        dateOfVisit: "2024-03-22T00:00:00.000Z",
        vetsName: "Vet one",
      },
      herd: {
        id: "site-1-id",
      },
      type: "REVIEW",
      createdAt: "2024-03-25T12:20:18.307Z",
      status: "IN_CHECK",
    };

    test("displays Number of sites for poultry applications", async () => {
      const options = {
        method: "GET",
        url: `${url}/PORE-1111-6666`,
        auth,
      };

      const poultryClaimsWithSites = [
        { ...poultryClaim, herd: { id: "site-1-id" } },
        { ...poultryClaim, herd: { id: "site-2-id" } },
        { ...poultryClaim, herd: { id: "site-3-id" } },
      ];

      getClaim.mockReturnValue(poultryClaim);
      getClaims.mockReturnValue({ claims: poultryClaimsWithSites });
      getApplication.mockReturnValue(poultryApplication);

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      // Should display "Number of sites" for poultry
      expect($(".govuk-summary-list__key").text()).toContain("Number of sites");

      // Should NOT display "Number of herds and flocks" for poultry
      expect($(".govuk-summary-list__key").text()).not.toContain("Number of herds and flocks");

      // Find the Number of sites row and check the value
      const sitesRow = $(".govuk-summary-list__row").filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Number of sites"),
      );
      expect(sitesRow.find(".govuk-summary-list__value").text().trim()).toBe("3");
    });

    test("counts unique sites for poultry applications", async () => {
      const options = {
        method: "GET",
        url: `${url}/PORE-1111-6666`,
        auth,
      };

      // Same site ID used multiple times should only count once
      const poultryClaimsWithDuplicateSites = [
        { ...poultryClaim, herd: { id: "site-1-id" } },
        { ...poultryClaim, herd: { id: "site-1-id" } },
        { ...poultryClaim, herd: { id: "site-2-id" } },
      ];

      getClaim.mockReturnValue(poultryClaim);
      getClaims.mockReturnValue({ claims: poultryClaimsWithDuplicateSites });
      getApplication.mockReturnValue(poultryApplication);

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const sitesRow = $(".govuk-summary-list__row").filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Number of sites"),
      );
      expect(sitesRow.find(".govuk-summary-list__value").text().trim()).toBe("2");
    });

    test("displays zero sites when no poultry claims have herd", async () => {
      const options = {
        method: "GET",
        url: `${url}/PORE-1111-6666`,
        auth,
      };

      const poultryClaimsWithoutSites = [{ ...poultryClaim, herd: undefined }];

      getClaim.mockReturnValue(poultryClaim);
      getClaims.mockReturnValue({ claims: poultryClaimsWithoutSites });
      getApplication.mockReturnValue(poultryApplication);

      const res = await server.inject(options);
      const $ = cheerio.load(res.payload);

      expect(res.statusCode).toBe(StatusCodes.OK);

      const sitesRow = $(".govuk-summary-list__row").filter((_, el) =>
        $(el).find(".govuk-summary-list__key").text().includes("Number of sites"),
      );
      expect(sitesRow.find(".govuk-summary-list__value").text().trim()).toBe("0");
    });
  });
});
