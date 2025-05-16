import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

const StaticMap = ({ marker }) => {
  const mapRef = useRef(null)
  const latitude = marker.latitude
  const longitude = marker.longitude
  const zoom = 15
  const position = [latitude, longitude]

  // More responsive styling
  const mapStyle = {
    height: '50vh', // Responsive height
    width: '100%', // Full width of container
    aspectRatio: '4/3', // Maintain aspect ratio
    border: '1px solid var(--border)',
    borderRadius: '0.5rem', // Rounded corners for better appearance
    margin: '1rem auto',
  }
  const interactionOptions = {
    zoomControl: false,
    doubleClickZoom: false,
    closePopupOnClick: false,
    dragging: false,
    zoomSnap: false,
    zoomDelta: false,
    trackResize: false,
    touchZoom: false,
    scrollWheelZoom: false,
  }

  // Make map recenter when container resizes
  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current

    // Function to handle resize
    const handleResize = () => {
      // Invalidate size recalculates dimensions
      map.invalidateSize()
      // Re-center the map
      map.setView(position, zoom)
    }

    // Call once on mount and set up resize listener
    handleResize()
    window.addEventListener('resize', handleResize)

    // Clean up
    return () => window.removeEventListener('resize', handleResize)
  }, [position, zoom])

  return (
    <MapContainer
      ref={mapRef}
      center={position}
      zoom={zoom}
      scrollWheelZoom={false}
      style={mapStyle}
      {...interactionOptions}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} />
    </MapContainer>
  )
}

export default StaticMap
