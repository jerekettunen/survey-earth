const {
  convertGeoJSONToBBox,
  createBBoxFromLatLong,
} = require('../../../utils/geoUtils')
const { describe, test, expect } = require('@jest/globals')

describe('geoUtils', () => {
  describe('convertGeoJSONToBBox', () => {
    test('should create bbox for Point geometry', () => {
      const point = {
        type: 'Point',
        coordinates: [25, 60],
      }

      const bbox = convertGeoJSONToBBox(point)

      expect(bbox).toEqual([24.99, 59.99, 25.01, 60.01])
    })

    test('should create bbox for Feature with Point geometry', () => {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [25, 60],
        },
        properties: {},
      }

      const bbox = convertGeoJSONToBBox(feature)

      expect(bbox).toEqual([24.99, 59.99, 25.01, 60.01])
    })

    test('should throw error for unsupported geometry type', () => {
      const geometry = {
        type: 'GeometryCollection',
        geometries: [],
      }

      expect(() => {
        convertGeoJSONToBBox(geometry)
      }).toThrow('Unsupported geometry type: GeometryCollection')
    })

    test('should throw error when no geometry is provided', () => {
      expect(() => {
        convertGeoJSONToBBox(null)
      }).toThrow('No geometry provided')
    })
  })
  describe('createBBoxFromLatLong', () => {
    test('should create bbox from lat/long', () => {
      const lat = 60
      const lng = 25
      const radiusKm = 1

      const bbox = createBBoxFromLatLong(lat, lng, radiusKm)

      // Use the actual values from the implementation
      expect(bbox[0]).toBeCloseTo(24.98198198198198, 14) // minLng
      expect(bbox[1]).toBeCloseTo(59.990990990990994, 14) // minLat
      expect(bbox[2]).toBeCloseTo(25.01801801801802, 14) // maxLng
      expect(bbox[3]).toBeCloseTo(60.009009009009006, 14) // maxLat
    })

    test('should create bbox with default radius', () => {
      const lat = 60
      const lng = 25

      const bbox = createBBoxFromLatLong(lat, lng)

      // Use the actual values from the implementation
      expect(bbox[0]).toBeCloseTo(24.98198198198198, 14) // minLng
      expect(bbox[1]).toBeCloseTo(59.990990990990994, 14) // minLat
      expect(bbox[2]).toBeCloseTo(25.01801801801802, 14) // maxLng
      expect(bbox[3]).toBeCloseTo(60.009009009009006, 14) // maxLat
    })
  })
})
