const {
  SentinelHubRequest,
  CRS_EPSG4326,
  MimeTypes,
  BBox,
  DataCollection,
} = require('@sentinel-hub/sentinelhub-js')
const axios = require('axios')
require('dotenv').config()

// SentinelHub OAuth credentials
const clientId = process.env.SENTINEL_HUB_CLIENT_ID
const clientSecret = process.env.SENTINEL_HUB_CLIENT_SECRET
const instanceId = process.env.SENTINEL_HUB_INSTANCE_ID

// Cache for auth tokens
let authToken = null
let tokenExpiry = null

/**
 * Get authentication token from SentinelHub
 */
const getAuthToken = async () => {
  // Check if we have a valid token already
  if (authToken && tokenExpiry && new Date() < tokenExpiry) {
    return authToken
  }

  try {
    const response = await axios.post(
      'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    authToken = response.data.access_token
    // Set expiry time slightly before the actual expiry
    tokenExpiry = new Date(Date.now() + response.data.expires_in * 900)
    return authToken
  } catch (error) {
    console.error('Error getting SentinelHub auth token:', error)
    throw error
  }
}

/**
 * Get available images for a geographical area and time period
 * @param {Object} params - Search parameters
 * @param {number[]} params.bbox - Bounding box [minLng, minLat, maxLng, maxLat]
 * @param {string} params.fromDate - Start date in ISO format
 * @param {string} params.toDate - End date in ISO format
 * @param {number} params.maxCloudCoverage - Maximum cloud coverage (0-100)
 * @returns {Promise<Array>} - Array of available images
 */
const getAvailableImages = async ({
  bbox,
  fromDate,
  toDate,
  maxCloudCoverage = 30,
}) => {
  try {
    const token = await getAuthToken()

    // Catalog API call to get available images
    const response = await axios.post(
      'https://services.sentinel-hub.com/api/v1/catalog/search',
      {
        bbox: bbox,
        timeRange: {
          from: fromDate,
          to: toDate,
        },
        collections: ['sentinel-2-l2a'],
        maxCloudCoverage: maxCloudCoverage,
        limit: 15, // Limit number of results
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    // Transform the response into a more usable format
    return response.data.features.map((feature) => ({
      id: feature.id,
      date: feature.properties.datetime,
      cloudCoverage: feature.properties.cloudCoverPercentage,
      source: 'sentinel-2-l2a',
      bands: ['B02', 'B03', 'B04', 'B08'], // Default bands
      // We'll generate these URLs when needed
      url: null,
      thumbnail: null,
      // Additional metadata
      metadata: feature.properties,
    }))
  } catch (error) {
    console.error('Error fetching available images:', error)
    throw error
  }
}

/**
 * Generate image URL for a specific image
 * @param {Object} params - Image parameters
 * @returns {Promise<string>} - URL to the image
 */
const generateImageUrl = async ({
  imageId,
  bbox,
  bands = ['B04', 'B03', 'B02'],
  width = 512,
  height = 512,
}) => {
  try {
    const token = await getAuthToken()

    const request = new SentinelHubRequest({
      evalscript: `
        //VERSION=3
        function setup() {
          return {
            input: ["${bands.join('", "')}"],
            output: { bands: 3 }
          };
        }

        function evaluatePixel(sample) {
          return [sample.${bands[0]}, sample.${bands[1]}, sample.${bands[2]}];
        }
      `,
      input: {
        bounds: {
          bbox: bbox,
          properties: {
            crs: CRS_EPSG4326,
          },
        },
        data: [
          {
            dataFilter: {
              timeRange: {
                from: imageId.split('_')[0],
                to: imageId.split('_')[0],
              },
              mosaickingOrder: 'leastCC',
            },
            type: DataCollection.SENTINEL2_L2A,
          },
        ],
      },
      output: {
        width: width,
        height: height,
        responses: [
          {
            identifier: 'default',
            format: { type: MimeTypes.JPEG },
          },
        ],
      },
    })

    const url = await request.getUrl({
      authToken: token,
      OrgId: instanceId,
    })

    return url
  } catch (error) {
    console.error('Error generating image URL:', error)
    throw error
  }
}

module.exports = {
  getAuthToken,
  getAvailableImages,
  generateImageUrl,
}
