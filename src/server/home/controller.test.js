import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { fetch } from 'undici'

vi.mock('undici', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual, // keep all real exports
    fetch: vi.fn(actual.fetch) // spy on fetch (calls real impl by default)
  }
})

describe('#homeController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(application)
    })
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(claim)
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/'
    })

    expect(result).toEqual(
      expect.stringContaining('Claim number: REBC-AAAA-AAAA')
    )
    expect(statusCode).toBe(statusCodes.ok)
  })
})

const application = {
  reference: 'IAHW-AAAA-AAAA',
  data: {
    organisation: {
      name: 'Fake org name',
      farmerName: 'Fake farmer name',
      email: 'fake.farmer.email@example.com.test',
      sbi: '0000000000',
      address: '1 fake street,fake town,United Kingdom',
      orgEmail: 'fake.org.email@example.com.test'
    }
  },
  createdAt: new Date()
}

const claim = {
  reference: 'REBC-AAAA-AAAA',
  statusId: 2,
  createdAt: new Date(),
  data: {
    typeOfLivestock: 'beef',
    dateOfVisit: new Date(),
    dateOfTesting: new Date(),
    isReview: true,
    herdName: 'beef',
    herdCph: '00/000/0000',
    isOnlyHerd: 'Yes',
    herdReasons: ['onlyHerd'],
    speciesNumbers: 'yes',
    vetsName: 'Fake Vet',
    vetRCVSNumber: '0000000',
    laboratoryURN: '000000',
    testResults: 'positive'
  }
}
