/* eslint-disable @stylistic/js/indent */
const axios = require('axios')
require('dotenv').config()
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const s3Client = new S3Client({ region: 'eu-north-1' })
const BUCKET_NAME = process.env.S3_THUMB_BUCKET_NAME || null
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || null

// SentinelHub OAuth credentials
const clientId = process.env.SENTINEL_HUB_CLIENT_ID
const clientSecret = process.env.SENTINEL_HUB_CLIENT_SECRET

// Cache for auth tokens
let authToken = null
let tokenExpiry = null

const _resetAuthTokenCache = () => {
  authToken = null
  tokenExpiry = null
}

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
  bandCombination = 'TRUE_COLOR',
}) => {
  try {
    const token = await getAuthToken()

    // Ensure dates are in ISO format YYYY-MM-DDT00:00:00Z
    const formatDate = (date) => {
      if (date instanceof Date) {
        return date.toISOString()
      }
      // If already a string, ensure it's properly formatted
      return new Date(date).toISOString()
    }

    const isoFromDate = formatDate(fromDate)
    const isoToDate = formatDate(toDate)

    console.log(`Using date range: ${isoFromDate} to ${isoToDate}`)

    // Catalog API call to get available images
    const response = await axios.post(
      'https://services.sentinel-hub.com/api/v1/catalog/search',
      {
        bbox: bbox,
        datetime: `${isoFromDate}/${isoToDate}`,
        collections: ['sentinel-2-l2a'],
        query: {
          'eo:cloud_cover': {
            lt: maxCloudCoverage,
          },
        },
        limit: 15, // Limit number of results
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    )

    return response.data.features.map((feature) => ({
      id: feature.id,
      date: feature.properties.datetime,
      cloudCoverage: feature.properties['eo:cloud_cover'],
      source: 'sentinel-2-l2a',
      bandCombination: bandCombination,
    }))
  } catch (error) {
    console.error('Error fetching available images:', error)
    if (error.response && error.response.data) {
      console.error('Error details:', error.response.data)
    }
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
  bandCombination = 'TRUE_COLOR',
  width = 512,
  height = 512,
}) => {
  console.log('Starting thumbnail generation with config:', {
    bucketName: BUCKET_NAME || 'NOT CONFIGURED',
    cloudfrontDomain: CLOUDFRONT_DOMAIN || 'NOT CONFIGURED',
  })
  try {
    const token = await getAuthToken()
    const bands = getBandsForCombination(bandCombination)

    // Extract date from the imageId using proper Sentinel-2 ID format parsing
    let fromDate, toDate

    // The format is typically: S2C_MSIL2A_20250516T095041_N0511_R079_T35VLG_20250516T122757
    if (imageId.includes('_MSIL2A_')) {
      // Extract the date portion (YYYYMMDD) and convert to ISO format YYYY-MM-DD
      const dateMatch = imageId.match(/_MSIL2A_(\d{8})T/)
      if (dateMatch && dateMatch[1]) {
        const dateStr = dateMatch[1]
        const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(
          4,
          6
        )}-${dateStr.slice(6, 8)}`
        fromDate = formattedDate
        toDate = formattedDate
        console.log(`Extracted date ${formattedDate} from image ID ${imageId}`)
      } else {
        // Fallback to a date range if parsing failed
        toDate = new Date().toISOString().split('T')[0]
        fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        console.log(
          `Falling back to date range ${fromDate} to ${toDate} for image ${imageId}`
        )
      }
    } else {
      // Direct date or catalog ID handling
      fromDate = imageId
      toDate = imageId

      if (!fromDate.match(/^\d{4}-\d{2}-\d{2}/)) {
        // Use last 30 days as fallback
        toDate = new Date().toISOString().split('T')[0]
        fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        console.log(
          `Falling back to date range ${fromDate} to ${toDate} for image ${imageId}`
        )
      }
    }

    const evalscript = `
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
    `

    // Use direct API call with axios
    const response = await axios.post(
      'https://services.sentinel-hub.com/api/v1/process',
      {
        input: {
          bounds: {
            bbox: bbox,
            properties: {
              crs: 'http://www.opengis.net/def/crs/EPSG/0/4326',
            },
          },
          data: [
            {
              dataFilter: {
                timeRange: {
                  from: `${fromDate}T00:00:00Z`,
                  to: `${toDate}T23:59:59Z`,
                },
                mosaickingOrder: 'leastCC',
              },
              type: 'sentinel-2-l2a',
            },
          ],
        },
        evalscript: evalscript,
        output: {
          width: width,
          height: height,
          responses: [
            {
              identifier: 'default',
              format: { type: 'image/png' },
            },
          ],
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'image/png',
          Authorization: `Bearer ${token}`,
        },
        responseType: 'arraybuffer',
      }
    )
    const base64 = Buffer.from(response.data).toString('base64')
    return `data:image/png;base64,${base64}`
  } catch (error) {
    if (error.response && error.response.data) {
      try {
        const errorMsg = Buffer.from(error.response.data).toString('utf8')
        console.error('Error from Sentinel Hub:', errorMsg)
      } catch (e) {
        console.error('Error generating image URL:', e)
      }
    } else {
      console.error('Error generating image URL:', error)
    }
    throw error
  }
}

const generateThumbnailUrl = async ({
  imageId,
  bbox,
  bandCombination = 'TRUE_COLOR',
  width = 96,
  height = 96,
}) => {
  try {
    const token = await getAuthToken()
    const bands = getBandsForCombination(bandCombination)

    // Fix date extraction
    let fromDate, toDate
    const dateMatch =
      imageId.match(/_MSI[^_]*_(\d{8})T/) ||
      imageId.match(/^(\d{4}-\d{2}-\d{2})/) ||
      imageId.match(/S2[AB]_(\d{8})/)

    // Process date match results
    if (dateMatch && dateMatch[1]) {
      const dateStr = dateMatch[1]
      // Format the date correctly based on the pattern matched
      const formattedDate = dateStr.includes('-')
        ? dateStr // Already in YYYY-MM-DD format
        : `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`

      fromDate = formattedDate
      toDate = formattedDate
      console.log(
        `Thumbnail: Extracted date ${formattedDate} from image ID ${imageId}`
      )
    } else {
      // Fallback to a date range if parsing failed
      toDate = new Date().toISOString().split('T')[0]
      fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      console.log(
        `Thumbnail: Falling back to date range ${fromDate} to ${toDate} for image ${imageId}`
      )
    }

    // Thumbnail-specific evalscript with contrast enhancement
    const evalscript = `
      //VERSION=3
      function setup() {
        return {
          input: ["${bands.join('", "')}"],
          output: { bands: 3 }
        };
      }

      function evaluatePixel(sample) {
        // Get band values
        let values = [sample.${bands[0]}, sample.${bands[1]}, sample.${
      bands[2]
    }];
        
        // Apply thumbnail-specific contrast enhancement
        for (let i = 0; i < values.length; i++) {
          values[i] = Math.max(0, Math.min(1, values[i]));
          // More aggressive contrast for thumbnails
          values[i] = (values[i] - 0.1) * (1.0 / 0.7);
          values[i] = Math.max(0, Math.min(1, values[i]));
        }
        
        return values;
      }
    `

    const response = await axios.post(
      'https://services.sentinel-hub.com/api/v1/process',
      {
        input: {
          bounds: {
            bbox: bbox,
            properties: {
              crs: 'http://www.opengis.net/def/crs/EPSG/0/4326',
            },
          },
          data: [
            {
              dataFilter: {
                timeRange: {
                  from: `${fromDate}T00:00:00Z`,
                  to: `${toDate}T23:59:59Z`,
                },
                mosaickingOrder: 'leastCC',
              },
              type: 'sentinel-2-l2a',
            },
          ],
        },
        evalscript: evalscript,
        output: {
          width: width,
          height: height,
          responses: [
            {
              identifier: 'default',
              format: { type: 'image/jpeg', quality: 70 },
            },
          ],
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'image/jpeg',
          Authorization: `Bearer ${token}`,
        },
        responseType: 'arraybuffer',
      }
    )

    // Create a safe key for S3
    const safeImageId = imageId.replace(/[^a-zA-Z0-9-_]/g, '_')
    const key = `thumbnails/${safeImageId}_${bandCombination}_${width}x${height}.jpg`

    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: response.data,
          ContentType: 'image/jpeg',
          CacheControl: 'max-age=31536000',
        })
      )

      // Return CloudFront URL
      const url = `https://${CLOUDFRONT_DOMAIN}/${key}`
      console.log(`Stored thumbnail for ${imageId} at ${url}`)
      return url
    } catch (s3Error) {
      // Fallback to base64 if S3 upload fails
      console.error(
        `S3 upload failed, falling back to base64: ${s3Error.message}`
      )
      const base64 = Buffer.from(response.data).toString('base64')
      return `data:image/jpeg;base64,${base64}`
    }
  } catch (error) {
    console.error('Error generating thumbnail:', error.message)
    throw new Error(`Failed to generate thumbnail: ${error.message}`)
  }
}

const getBandsForCombination = (bandCombination) => {
  switch (bandCombination) {
    case 'FALSE_COLOR':
      return ['B08', 'B04', 'B03']
    case 'TRUE_COLOR':
    default:
      return ['B04', 'B03', 'B02'] // Default to true color
  }
}

module.exports = {
  getAuthToken,
  getAvailableImages,
  generateImageUrl,
  getBandsForCombination,
  generateThumbnailUrl,
  _resetAuthTokenCache,
}
