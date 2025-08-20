import {
  formatStatusId,
  upperFirstLetter,
  formattedDateToUk
} from '../common/helpers/display-helper.js'
import { getStyleClassByStatus } from '../common/constants/status.js'

/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 */
export const homeController = {
  handler(request, h) {
    return h.view('home/index', {
      pageTitle: 'Administration - View Claim',
      heading: '',
      ...getPageData(request.params.reference ?? 'REBC-AAAA-AAA2')
    })
  }
}

const getPageData = (claimReference) => {
  const application = getApplicationFromBackend(claimReference)
  const claim = getClaimFromBackend(claimReference)

  return {
    backLink: 'bar',
    page: 1,
    returnPage: 'agreement',
    isFlagged: false,
    reference: claimReference,
    applicationReference: claimReference,
    claimOrAgreement: 'claim',
    title: upperFirstLetter(application.data.organisation.name),
    claimSummaryDetails: claimSummaryDetails(claim, application),
    status: {
      normalType: upperFirstLetter(
        formatStatusId(claim.statusId).toLowerCase()
      ),
      tagClass: getStyleClassByStatus(formatStatusId(claim.statusId))
    },
    applicationSummaryDetails: applicationSummaryDetails(application),
    errors: [],
    herdBreakdown: {
      beef: 1,
      dairy: 0,
      sheep: 0,
      pigs: 0
    }
  }
}

const getApplicationFromBackend = (claimReference) => {
  // TO DO get from backend service
  return {
    reference: 'IAHW-AAAA-AAAA',
    data: {
      organisation: {
        name: 'MRS I KING',
        farmerName: 'Michael Ann Murza',
        email: 'michaelmurzac@azrumleahcimn.com.test',
        sbi: 107597689,
        address: 'WARRINGTON,EX6 7XE,United Kingdom',
        orgEmail: '	mrsruthlotterp@rettolhtursrmn.com.test'
      }
    },
    createdAt: new Date()
  }
}

const getClaimFromBackend = (claimReference) => {
  // TO DO get from backend service
  return {
    reference: claimReference,
    statusId: 9,
    createdAt: new Date(),
    data: {
      typeOfLivestock: 'beef',
      dateOfVisit: new Date(),
      dateOfTesting: new Date(),
      isReview: true,
      herdName: 'beef',
      herdCph: '11/111/1111',
      isOnlyHerd: 'Yes',
      herdReasons: ['onlyHerd'],
      speciesNumbers: 'yes',
      vetsName: 'Hope',
      vetRCVSNumber: '1122334',
      laboratoryURN: '887760',
      testResults: 'positive'
    }
  }
}

const applicationSummaryDetails = (application) => {
  return [
    buildKeyValueJson('Agreement number', application.reference),
    buildKeyValueJson(
      'Agreement date',
      formattedDateToUk(application.createdAt)
    ),
    buildKeyValueJson(
      'Agreement holder',
      application.data.organisation.farmerName
    ),
    buildKeyValueJson(
      'Agreement holder email',
      application.data.organisation.email
    ),
    buildKeyValueJson('SBI number', application.data.organisation.sbi),
    buildKeyValueJson(
      'Address',
      application.data.organisation.address.split(',').join(', ')
    ),
    buildKeyValueJson('Business email', application.data.organisation.orgEmail),
    buildKeyValueJson('Flagged', '')
  ]
}

const claimSummaryDetails = (claim, application) => {
  return [
    {
      key: { text: 'Status' },
      value: {
        html: `<span class='app-long-tag'><span class='govuk-tag responsive-text ${getStyleClassByStatus(formatStatusId(claim.statusId))}'> ${upperFirstLetter(formatStatusId(claim.statusId).toLowerCase())} </span></span>`
      },
      actions: []
    },
    buildKeyValueJson('Claim date', formattedDateToUk(claim.createdAt), true),
    buildKeyValueJson(
      'Business name',
      upperFirstLetter(application.data.organisation.name),
      true
    ),
    buildKeyValueJson(
      'Livestock',
      upperFirstLetter(
        ['pigs', 'sheep'].includes(claim.data.typeOfLivestock)
          ? claim.data.typeOfLivestock
          : `${claim.data.typeOfLivestock} cattle`
      ),
      true
    ),
    buildKeyValueJson(
      'Type of visit',
      claim.data.isReview
        ? 'Animal health and welfare review'
        : 'Endemic disease follow-ups',
      true
    ),
    {
      ...buildKeyValueJson(
        'Date of visit',
        formattedDateToUk(claim.data.dateOfVisit),
        true
      ),
      actions: []
    },
    {
      key: { text: `${upperFirstLetter('herd')} name` },
      value: { html: claim.data.herdName ?? `Unnamed ${'herd'}` }
    },
    {
      key: { text: `${upperFirstLetter('herd')} CPH` },
      value: { html: claim.data.herdCph }
    },
    {
      key: { text: `Is this the only herd on this SBI?` },
      value: { html: claim.data.isOnlyHerd }
    },
    {
      key: { text: `Reasons the herd is separate` },
      value: { html: getHerdReasonsText(claim.data.herdReasons, false) }
    },
    buildKeyValueJson(
      'Date of sampling',
      claim.data.dateOfTesting && formattedDateToUk(claim.data.dateOfTesting),
      true
    ),
    buildKeyValueJson(
      speciesEligibleNumber[claim.data.typeOfLivestock],
      upperFirstLetter(claim.data.speciesNumbers),
      true
    ),
    {
      ...buildKeyValueJson(
        "Vet's name",
        upperFirstLetter(claim.data.vetsName),
        true
      ),
      actions: []
    },
    {
      ...buildKeyValueJson("Vet's RCVS number", claim.data.vetRCVSNumber, true),
      actions: []
    },
    buildKeyValueJson(
      'URN or test certificate',
      claim.data.laboratoryURN,
      true
    ),
    buildKeyValueJson(
      'Test result',
      upperFirstLetter(claim.data.testResults),
      true
    )
  ]
}

const buildKeyValueJson = (keyText, valueText, valueAsHtml = false) => {
  if (valueAsHtml) {
    return {
      key: { text: keyText },
      value: { html: valueText }
    }
  }
  return {
    key: { text: keyText },
    value: { text: valueText }
  }
}

const getHerdReasonsText = (reasons, isSheep) => {
  if (!reasons) {
    return '-'
  }

  const fleshedOutReasons = {
    onlyHerd: `This is the only ${isSheep ? 'flock' : 'herd'}`
  }

  const formattedReasons = reasons.map((reason) => fleshedOutReasons[reason])

  const startOfHtml = '<ul class="govuk-list govuk-list--bullet">'
  const endOfHtml = '</ul>'
  const middleOfHtml = formattedReasons
    .map((reason) => `<li>${reason}</li>`)
    .join('\n')

  return `${startOfHtml}${middleOfHtml}${endOfHtml}`
}

const speciesEligibleNumber = {
  beef: '11 or more beef cattle',
  dairy: '11 or more dairy cattle',
  pigs: '51 or more pigs',
  sheep: '21 or more sheep'
}
