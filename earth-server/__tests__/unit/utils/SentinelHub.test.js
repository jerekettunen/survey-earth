const nock = require('nock')
const { describe, test, expect, beforeEach } = require('@jest/globals')
const {
  getAuthToken,
  getAvailableImages,
  generateImageUrl,
  _resetAuthTokenCache,
} = require('../../../utils/SentinelHub')

// Mock environment variables
process.env.SENTINEL_CLIENT_ID = 'test-client-id'
process.env.SENTINEL_CLIENT_SECRET = 'test-client-secret'

describe('SentinelHub API', () => {
  beforeEach(() => {
    // Clear all nock mocks before each test
    nock.cleanAll()
    if (typeof _resetAuthTokenCache === 'function') {
      _resetAuthTokenCache()
    }
  })

  describe('getAuthToken', () => {
    test('should fetch and return auth token', async () => {
      // Mock the token endpoint response
      nock('https://services.sentinel-hub.com')
        .post('/auth/realms/main/protocol/openid-connect/token')
        .reply(200, {
          access_token: 'mock-token',
          expires_in: 3600,
        })

      const token = await getAuthToken()
      expect(token).toBe('mock-token')
    })

    test('should handle auth errors', async () => {
      // Mock a failed auth response
      nock('https://services.sentinel-hub.com')
        .post('/auth/realms/main/protocol/openid-connect/token')
        .reply(401, { error: 'invalid_client' })

      await expect(getAuthToken()).rejects.toThrow()
    })
  })

  describe('getAvailableImages', () => {
    test('should fetch available satellite images', async () => {
      // Mock the auth token request first
      nock('https://services.sentinel-hub.com')
        .post('/auth/realms/main/protocol/openid-connect/token')
        .reply(200, {
          access_token: 'mock-token',
          expires_in: 3600,
        })

      // Mock the catalog search endpoint
      nock('https://services.sentinel-hub.com')
        .post('/api/v1/catalog/search')
        .reply(200, {
          features: [
            {
              id: 'S2B_MSIL2A_20250517T100559_N0511_R022_T34WFT_20250517T130149',
              properties: {
                datetime: '2025-05-17T10:05:59Z',
                'eo:cloud_cover': 15.2,
              },
            },
          ],
        })

      const images = await getAvailableImages({
        bbox: [24.0, 60.0, 25.0, 61.0],
        fromDate: '2025-05-01',
        toDate: '2025-05-20',
        maxCloudCoverage: 30,
        bandCombination: 'TRUE_COLOR',
      })

      expect(images).toHaveLength(1)
      expect(images[0]).toEqual({
        id: 'S2B_MSIL2A_20250517T100559_N0511_R022_T34WFT_20250517T130149',
        date: '2025-05-17T10:05:59Z',
        cloudCoverage: 15.2,
        source: 'sentinel-2-l2a',
        bandCombination: 'TRUE_COLOR',
      })
    })
  })

  describe('generateImageUrl', () => {
    test('should generate image URL for a satellite image', async () => {
      // Mock auth token
      nock('https://services.sentinel-hub.com')
        .post('/auth/realms/main/protocol/openid-connect/token')
        .reply(200, {
          access_token: 'mock-token',
          expires_in: 3600,
        })

      // Mock the processing API with a buffer response
      const mockImageBuffer = Buffer.from('fake-image-data')
      nock('https://services.sentinel-hub.com')
        .post('/api/v1/process')
        .reply(200, mockImageBuffer)

      const imageUrl = await generateImageUrl({
        imageId: 'S2B_MSIL2A_20250517T100559_N0511_R022_T34WFT_20250517T130149',
        bbox: [24.0, 60.0, 25.0, 61.0],
        bandCombination: 'TRUE_COLOR',
      })

      expect(imageUrl).toMatch(/^data:image\/jpeg;base64,/)
    })
  })
})
