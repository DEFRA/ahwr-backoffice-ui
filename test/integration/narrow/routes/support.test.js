import * as cheerio from "cheerio";

import { StatusCodes } from "http-status-codes";
import { permissions } from "../../../../app/auth/permissions.js";
import { createServer } from "../../../../app/server.js";
import { getCrumbs } from "../../../utils/get-crumbs.js";
import {
  getAgreementMessagesDocument,
  getApplicationDocument,
  getClaimDocument,
  getClaimMessagesDocument,
  getAgreementLogsDocument,
  getHerdDocument,
  getPaymentDocument,
  getPaymentDocumentWithRefresh,
  getClaimCommsDocument,
  getAgreementCommsDocument,
} from "../../../../app/routes/support/support-calls.js";

const { administrator, user, processor, recommender, authoriser, support } = permissions;

jest.mock("../../../../app/routes/support/support-calls.js");

describe("support-routes", () => {
  const supportAuth = {
    strategy: "session-auth",
    credentials: { scope: [support], account: { name: "test admin" } },
  };

  let crumb;
  let server;

  beforeAll(async () => {
    server = await createServer({ testPort: 6001 });
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    crumb = await getCrumbs(server);
  });

  // gets just calls and gets the default view
  describe("get", () => {
    describe("support user", () => {
      let response;

      beforeEach(async () => {
        const options = {
          method: "GET",
          url: "/support",
          auth: supportAuth,
          headers: { cookie: `crumb=${crumb}` },
        };
        response = await server.inject(options);
      });

      it("shows the title", async () => {
        expect(response.statusCode).toBe(StatusCodes.OK);
        const $ = cheerio.load(response.payload);
        expect($("h1.govuk-heading-xl").text()).toContain("Support");
      });

      it.each([
        {
          name: "application",
          formClass: "ahwr-application-search-form",
          inputId: "application-reference",
        },
        { name: "claim", formClass: "ahwr-claim-search-form", inputId: "claim-reference" },
        { name: "herd", formClass: "ahwr-herd-search-form", inputId: "herd-id" },
      ])("shows the $name form", async ({ formClass, inputId }) => {
        expect(response.statusCode).toBe(StatusCodes.OK);
        const $ = cheerio.load(response.payload);

        expect($(`form.${formClass}`)).toHaveLength(1);
        expect($(`form.${formClass}`).attr("action")).toBe("/support");
        expect($(`#${inputId}`)).toHaveLength(1);
      });
    });

    it("returns 302 for now", async () => {
      const options = {
        method: "GET",
        url: "/support",
      };
      const response = await server.inject(options);

      expect(response.statusCode).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    it("returns 403 for user without support permissions", async () => {
      const options = {
        method: "GET",
        url: "/support",
        auth: {
          strategy: "session-auth",
          credentials: {
            scope: [user, processor, recommender, authoriser, administrator],
            account: { name: "test user" },
          },
        },
      };
      const response = await server.inject(options);

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
      const $ = cheerio.load(response.payload);
      expect($("#_403")).toHaveLength(1);
    });
  });

  // post we will have for each possible support call
  // those calls will be made with wreck
  // Therefore we will need to mock wreck.
  describe("post", () => {
    const applicationReference = "someReference";

    // builds the POST options shared by every support call,
    // injecting the crumb and merging in only the payload changes
    const postOptions = (payload) => ({
      method: "POST",
      url: "/support",
      auth: supportAuth,
      headers: { cookie: `crumb=${crumb}` },
      payload: { crumb, ...payload },
    });

    describe("non existing action", () => {
      it("returns not found", async () => {
        const options = postOptions({ applicationReference, action: "delete" });

        const response = await server.inject(options);

        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child").text()).toContain(
          "Action delete is not supported.",
        );
      });
    });

    describe("search application", () => {
      it("throws error if no application reference passed", async () => {
        const options = postOptions({ action: "searchApplication" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#application-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Application reference missing.",
        );
        expect($("#applicationDocument")).toHaveLength(0);
      });

      it("throws error if only spaces passed", async () => {
        const options = postOptions({ applicationReference: "   ", action: "searchApplication" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#application-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Application reference missing.",
        );
        expect($("#applicationDocument")).toHaveLength(0);
      });

      it("shows application information when requested", async () => {
        getApplicationDocument.mockResolvedValue({ document: { some: "value", another: "entry" } });

        const options = postOptions({ applicationReference, action: "searchApplication" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#applicationDocument");
      });

      it("shows application information when requested removing spaces", async () => {
        getApplicationDocument.mockResolvedValue({ document: { some: "value", another: "entry" } });

        const options = postOptions({
          applicationReference: `  ${applicationReference}  `,
          action: "searchApplication",
        });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#applicationDocument");
      });
    });

    describe("search claim", () => {
      it("throws error if no claim reference passed", async () => {
        const options = postOptions({ action: "searchClaim" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#claim-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Claim reference missing.",
        );
        expect($("#claimDocument")).toHaveLength(0);
      });

      it("throws error if only spaces passed", async () => {
        const options = postOptions({ claimReference: "   ", action: "searchClaim" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#claim-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Claim reference missing.",
        );
        expect($("#claimDocument")).toHaveLength(0);
      });

      it("shows claim information when requested", async () => {
        getClaimDocument.mockResolvedValue({ document: { some: "value", another: "entry" } });

        const claimReference = "someReference";
        const options = postOptions({ claimReference, action: "searchClaim" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#claimDocument");
      });

      it("shows claim information when requested removing spaces", async () => {
        getClaimDocument.mockResolvedValue({ document: { some: "value", another: "entry" } });

        const claimReference = "someReference";
        const options = postOptions({
          claimReference: `  ${claimReference}  `,
          action: "searchClaim",
        });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#claimDocument");
      });
    });

    describe("search herd", () => {
      it("throws error if no herd reference passed", async () => {
        const options = postOptions({ action: "searchHerd" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe("#herd-id");
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Herd id missing.",
        );
        expect($("#herdDocument")).toHaveLength(0);
      });

      it("throws error if only spaces passed", async () => {
        const options = postOptions({ HerdId: "   ", action: "searchHerd" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe("#herd-id");
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Herd id missing.",
        );
        expect($("#applicationDocument")).toHaveLength(0);
      });

      it("shows herd information when requested", async () => {
        getHerdDocument.mockResolvedValue({ document: { some: "value", another: "entry" } });

        const herdId = "someReference";
        const options = postOptions({ herdId, action: "searchHerd" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#herdDocument");
      });

      it("shows herd information when requested removing spaces", async () => {
        getHerdDocument.mockResolvedValue({ document: { some: "value", another: "entry" } });

        const herdId = "someReference";
        const options = postOptions({
          herdId: `  ${herdId}  `,
          action: "searchHerd",
        });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#herdDocument");
      });
    });

    describe("search payment status", () => {
      it("throws error if no payment reference passed", async () => {
        const options = postOptions({ action: "searchPaymentStatus" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#payment-status-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Payment status reference missing.",
        );
        expect($("#paymentStatus")).toHaveLength(0);
      });

      it("throws error if only spaces passed", async () => {
        const options = postOptions({
          paymentStatusReference: "   ",
          action: "searchPaymentStatus",
        });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#payment-status-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Payment status reference missing.",
        );
        expect($("#paymentStatus")).toHaveLength(0);
      });

      it("shows payment information when requested", async () => {
        getPaymentDocumentWithRefresh.mockResolvedValue({
          document: { some: "value", another: "entry" },
        });

        const paymentStatusReference = "someReference";
        const options = postOptions({ paymentStatusReference, action: "searchPaymentStatus" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#paymentStatus");
      });

      it("shows payment information when requested removing spaces", async () => {
        getPaymentDocumentWithRefresh.mockResolvedValue({
          document: { some: "value", another: "entry" },
        });

        const paymentStatusReference = "someReference";
        const options = postOptions({
          paymentStatusReference: `  ${paymentStatusReference}  `,
          action: "searchPaymentStatus",
        });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#paymentStatus");
      });
    });

    describe("search payment document", () => {
      it("throws error if no payment reference passed", async () => {
        const options = postOptions({ action: "searchPayment" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#payment-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Payment reference missing.",
        );
        expect($("#paymentDocument")).toHaveLength(0);
      });

      it("throws error if only spaces passed", async () => {
        const options = postOptions({ paymentReference: "   ", action: "searchPayment" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#payment-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Payment reference missing.",
        );
        expect($("#paymentDocument")).toHaveLength(0);
      });

      it("shows payment information when requested", async () => {
        getPaymentDocument.mockResolvedValue({ document: { some: "value", another: "entry" } });

        const paymentReference = "someReference";
        const options = postOptions({ paymentReference, action: "searchPayment" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#paymentDocument");
      });

      it("shows payment information when requested removing spaces", async () => {
        getPaymentDocument.mockResolvedValue({ document: { some: "value", another: "entry" } });

        const paymentReference = "someReference";
        const options = postOptions({
          paymentReference: `  ${paymentReference}  `,
          action: "searchPayment",
        });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#paymentDocument");
      });
    });

    describe("search agreement messages", () => {
      it("throws error if no agreement reference passed", async () => {
        const options = postOptions({ action: "searchAgreementMessages" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#agreement-messages-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Agreement reference missing.",
        );
        expect($("#agreementMessagesDocument")).toHaveLength(0);
      });

      it("throws error if only spaces passed", async () => {
        const options = postOptions({
          agreementMessageReference: "   ",
          action: "searchAgreementMessages",
        });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#agreement-messages-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Agreement reference missing.",
        );
        expect($("#agreementMessagesDocument")).toHaveLength(0);
      });

      it("shows agreement information when requested", async () => {
        getAgreementMessagesDocument.mockResolvedValue({
          document: { some: "value", another: "entry" },
        });

        const agreementMessagesReference = "someReference";
        const options = postOptions({
          agreementMessagesReference,
          action: "searchAgreementMessages",
        });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#agreementMessagesDocument");
      });

      it("shows agreement information when requested removing spaces", async () => {
        getAgreementMessagesDocument.mockResolvedValue({
          document: { some: "value", another: "entry" },
        });

        const agreementMessagesReference = "someReference";
        const options = postOptions({
          agreementMessagesReference: `  ${agreementMessagesReference}  `,
          action: "searchAgreementMessages",
        });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#agreementMessagesDocument");
      });
    });

    describe("search claim messages", () => {
      it("throws error if no claim reference passed", async () => {
        const options = postOptions({ action: "searchClaimMessages" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#claim-messages-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Claim reference missing.",
        );
        expect($("#claimMessagesDocument")).toHaveLength(0);
      });

      it("throws error if only spaces passed", async () => {
        const options = postOptions({
          claimMessageReference: "   ",
          action: "searchClaimMessages",
        });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#claim-messages-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Claim reference missing.",
        );
        expect($("#claimMessagesDocument")).toHaveLength(0);
      });

      it("shows claim information when requested", async () => {
        getClaimMessagesDocument.mockResolvedValue({
          document: { some: "value", another: "entry" },
        });

        const claimMessagesReference = "someReference";
        const options = postOptions({ claimMessagesReference, action: "searchClaimMessages" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#claimMessagesDocument");
      });

      it("shows claim information when requested removing spaces", async () => {
        getClaimMessagesDocument.mockResolvedValue({
          document: { some: "value", another: "entry" },
        });

        const claimMessagesReference = "someReference";
        const options = postOptions({
          claimMessagesReference: `  ${claimMessagesReference}  `,
          action: "searchClaimMessages",
        });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#claimMessagesDocument");
      });
    });

    describe("search agreement document logs", () => {
      it("throws error if no agreement reference passed", async () => {
        const options = postOptions({ action: "searchAgreementLogs" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#agreement-log-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Agreement reference missing.",
        );
        expect($("#agreementLogsDocument")).toHaveLength(0);
      });

      it("throws error if only spaces passed", async () => {
        const options = postOptions({
          agreementLogReference: "   ",
          action: "searchAgreementLogs",
        });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#agreement-log-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Agreement reference missing.",
        );
        expect($("#agreementLogsDocument")).toHaveLength(0);
      });

      it("shows document information when requested", async () => {
        getAgreementLogsDocument.mockResolvedValue({
          document: { some: "value", another: "entry" },
        });

        const agreementLogReference = "someReference";
        const options = postOptions({ agreementLogReference, action: "searchAgreementLogs" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#agreementLogsDocument");
      });
    });

    describe("search agreement comms", () => {
      it("throws error if no agreement reference passed", async () => {
        const options = postOptions({ action: "searchAgreementComms" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#agreement-comms-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Agreement reference missing.",
        );
        expect($("#agreementCommsDocument")).toHaveLength(0);
      });

      it("throws error if only spaces passed", async () => {
        const options = postOptions({
          agreementCommsReference: "   ",
          action: "searchAgreementComms",
        });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#agreement-comms-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Agreement reference missing.",
        );
        expect($("#agreementCommsDocument")).toHaveLength(0);
      });

      it("shows agreement information when requested", async () => {
        getAgreementCommsDocument.mockResolvedValue({
          document: { some: "value", another: "entry" },
        });

        const agreementCommsReference = "someReference";
        const options = postOptions({ agreementCommsReference, action: "searchAgreementComms" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#agreementCommsDocument");
      });

      it("shows agreement information when requested removing spaces", async () => {
        getAgreementCommsDocument.mockResolvedValue({
          document: { some: "value", another: "entry" },
        });

        const agreementCommsReference = "someReference";
        const options = postOptions({
          agreementCommsReference: `  ${agreementCommsReference}  `,
          action: "searchAgreementComms",
        });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#agreementCommsDocument");
      });
    });

    describe("search claim comms", () => {
      it("throws error if no claim reference passed", async () => {
        const options = postOptions({ action: "searchClaimComms" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#claim-comms-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Claim reference missing.",
        );
        expect($("#claimCommsDocument")).toHaveLength(0);
      });

      it("throws error if only spaces passed", async () => {
        const options = postOptions({ claimCommsReference: "   ", action: "searchClaimComms" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        const $ = cheerio.load(response.payload);
        expect($(".govuk-error-summary__list li:first-child a").attr("href")).toBe(
          "#claim-comms-reference",
        );
        expect($(".govuk-error-summary__list li:first-child a").text()).toContain(
          "Claim reference missing.",
        );
        expect($("#claimCommsDocument")).toHaveLength(0);
      });

      it("shows claim information when requested", async () => {
        getClaimCommsDocument.mockResolvedValue({
          document: { some: "value", another: "entry" },
        });

        const claimCommsReference = "someReference";
        const options = postOptions({ claimCommsReference, action: "searchClaimComms" });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#claimCommsDocument");
      });

      it("shows claim information when requested removing spaces", async () => {
        getClaimCommsDocument.mockResolvedValue({
          document: { some: "value", another: "entry" },
        });

        const claimCommsReference = "someReference";
        const options = postOptions({
          claimCommsReference: `  ${claimCommsReference}  `,
          action: "searchClaimComms",
        });
        const response = await server.inject(options);
        expect(response.statusCode).toBe(StatusCodes.OK);

        expect(response).toShow("#claimCommsDocument");
      });
    });
  });
});
