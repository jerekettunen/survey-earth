/**
 * Convert GeoJSON to BBox format for SentinelHub
 * @param {Object} geojson - GeoJSON object
 * @returns {number[]} - BBox in format [minLng, minLat, maxLng, maxLat]
 */
const convertGeoJSONToBBox = (geojson) => {
  // Handle different GeoJSON types
  let coordinates = []

  if (!geojson) {
    throw new Error('No geometry provided')
  }

  if (geojson.type === 'Feature') {
    geojson = geojson.geometry
  }

  if (geojson.type === 'Point') {
    // For a point, create a small bounding box around it
    const [lng, lat] = geojson.coordinates
    return [lng - 0.01, lat - 0.01, lng + 0.01, lat + 0.01]
  } else if (geojson.type === 'Polygon') {
    coordinates = geojson.coordinates[0] // Outer ring
  } else if (geojson.type === 'MultiPolygon') {
    coordinates = geojson.coordinates.flat(1) // Flatten all polygons
  } else if (geojson.type === 'LineString') {
    coordinates = geojson.coordinates
  } else if (geojson.type === 'MultiLineString') {
    coordinates = geojson.coordinates.flat(1)
  } else {
    throw new Error(`Unsupported geometry type: ${geojson.type}`)
  }

  // Calculate bounds
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity

  coordinates.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng)
    minLat = Math.min(minLat, lat)
    maxLng = Math.max(maxLng, lng)
    maxLat = Math.max(maxLat, lat)
  })

  return [minLng, minLat, maxLng, maxLat]
}

// Alternative simpler implementation if there's no boundary field
// This creates a bounding box around the project's lat/long point
const createBBoxFromLatLong = (lat, lng, radiusKm = 1) => {
  // Approximate conversion (not accurate for large distances or near poles)
  const latDelta = radiusKm / 111 // 1 degree ~ 111km
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180))

  return [
    lng - lngDelta, // minLng
    lat - latDelta, // minLat
    lng + lngDelta, // maxLng
    lat + latDelta, // maxLat
  ]
}

module.exports = {
  convertGeoJSONToBBox,
  createBBoxFromLatLong,
}
