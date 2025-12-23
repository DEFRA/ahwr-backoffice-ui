import { getApplicationClaimDetails } from "../../../../../app/routes/models/application-claim.js";
import { oldWorldApplication } from "../../../../data/ow-application.js";

describe("Application-claim model", () => {
  test("getClaimData - Valid Data with date of claim in application data", async () => {
    const statusActions = { items: [{ test: "change status" }] };
    const visitDateActions = { items: [{ test: "change visit date" }] };
    const vetsNameActions = { items: [{ test: "change vets name" }] };
    const vetRCVSActions = { items: [{ test: "change RCVS" }] };
    const res = getApplicationClaimDetails(
      oldWorldApplication,
      statusActions,
      visitDateActions,
      vetsNameActions,
      vetRCVSActions,
    );

    expect(res).toEqual([
      {
        key: { text: "Status" },
        value: {
          html: '<span class="govuk-tag app-long-tag govuk-tag">Ready to pay</span>',
        },
        actions: statusActions,
      },
      {
        key: { text: "Date of review" },
        value: {
          text: new Intl.DateTimeFormat("en-GB").format(
            new Date(oldWorldApplication.data.visitDate),
          ),
        },
        actions: visitDateActions,
      },
      {
        key: { text: "Date of testing" },
        value: {
          text: new Intl.DateTimeFormat("en-GB").format(
            new Date(oldWorldApplication.data.dateOfTesting),
          ),
        },
      },
      {
        key: { text: "Date of claim" },
        value: {
          text: new Intl.DateTimeFormat("en-GB").format(
            new Date(oldWorldApplication.data.dateOfClaim),
          ),
        },
      },
      { key: { text: "Review details confirmed" }, value: { text: "Yes" } },
      {
        key: { text: "Vet’s name" },
        value: { text: oldWorldApplication.data.vetName },
        actions: vetsNameActions,
      },
      {
        key: { text: "Vet’s RCVS number" },
        value: { text: oldWorldApplication.data.vetRcvs },
        actions: vetRCVSActions,
      },
      {
        key: { text: "Test results unique reference number (URN)" },
        value: { text: oldWorldApplication.data.urnResult },
      },
    ]);
  });

  test("getClaimData - Valid Data with no date of testing", async () => {
    const statusActions = { items: [{ test: "change status" }] };
    const visitDateActions = { items: [{ test: "change visit date" }] };
    const vetsNameActions = { items: [{ test: "change vets name" }] };
    const vetRCVSActions = { items: [{ test: "change RCVS" }] };
    const res = getApplicationClaimDetails(
      { ...oldWorldApplication, data: { ...oldWorldApplication.data, dateOfTesting: undefined } },
      statusActions,
      visitDateActions,
      vetsNameActions,
      vetRCVSActions,
    );

    expect(res).toEqual([
      {
        key: { text: "Status" },
        value: {
          html: '<span class="govuk-tag app-long-tag govuk-tag">Ready to pay</span>',
        },
        actions: statusActions,
      },
      {
        key: { text: "Date of review" },
        value: {
          text: new Intl.DateTimeFormat("en-GB").format(
            new Date(oldWorldApplication.data.visitDate),
          ),
        },
        actions: visitDateActions,
      },
      {
        key: { text: "Date of testing" },
        value: {
          text: "N/A",
        },
      },
      {
        key: { text: "Date of claim" },
        value: {
          text: new Intl.DateTimeFormat("en-GB").format(
            new Date(oldWorldApplication.data.dateOfClaim),
          ),
        },
      },
      { key: { text: "Review details confirmed" }, value: { text: "Yes" } },
      {
        key: { text: "Vet’s name" },
        value: { text: oldWorldApplication.data.vetName },
        actions: vetsNameActions,
      },
      {
        key: { text: "Vet’s RCVS number" },
        value: { text: oldWorldApplication.data.vetRcvs },
        actions: vetRCVSActions,
      },
      {
        key: { text: "Test results unique reference number (URN)" },
        value: { text: oldWorldApplication.data.urnResult },
      },
    ]);
  });

  test("getClaimData - Data returned for paid status", async () => {
    const statusActions = { items: [{ test: "change status" }] };
    const visitDateActions = { items: [{ test: "change visit date" }] };
    const vetsNameActions = { items: [{ test: "change vets name" }] };
    const vetRCVSActions = { items: [{ test: "change RCVS" }] };
    const res = getApplicationClaimDetails(
      { ...oldWorldApplication, status: "PAID" },
      statusActions,
      visitDateActions,
      vetsNameActions,
      vetRCVSActions,
    );

    expect(res).toEqual([
      {
        key: { text: "Status" },
        value: {
          html: '<span class="govuk-tag app-long-tag govuk-tag--blue">Paid</span>',
        },
        actions: statusActions,
      },
      {
        key: { text: "Date of review" },
        value: {
          text: new Intl.DateTimeFormat("en-GB").format(
            new Date(oldWorldApplication.data.visitDate),
          ),
        },
        actions: visitDateActions,
      },
      {
        key: { text: "Date of testing" },
        value: {
          text: new Intl.DateTimeFormat("en-GB").format(
            new Date(oldWorldApplication.data.dateOfTesting),
          ),
        },
      },
      {
        key: { text: "Date of claim" },
        value: {
          text: new Intl.DateTimeFormat("en-GB").format(
            new Date(oldWorldApplication.data.dateOfClaim),
          ),
        },
      },
      { key: { text: "Review details confirmed" }, value: { text: "Yes" } },
      {
        key: { text: "Vet’s name" },
        value: { text: oldWorldApplication.data.vetName },
        actions: vetsNameActions,
      },
      {
        key: { text: "Vet’s RCVS number" },
        value: { text: oldWorldApplication.data.vetRcvs },
        actions: vetRCVSActions,
      },
      {
        key: { text: "Test results unique reference number (URN)" },
        value: { text: oldWorldApplication.data.urnResult },
      },
    ]);
  });
});
