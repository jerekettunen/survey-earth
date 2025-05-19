import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

const StaticMap = ({ marker }) => {
  const mapRef = useRef(null)
  const latitude = marker.latitude
  const longitude = marker.longitude
  const zoom = 15
  const position = [latitude, longitude]

  const mapStyle = {
    height: '100%', // Match the parent's height
    width: '100%', // Full width
    borderRadius: 'inherit',
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

    setTimeout(() => {
      mapRef.current.invalidateSize()
      mapRef.current.setView(position, zoom)
    }, 100)

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
