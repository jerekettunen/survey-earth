import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const StaticMap = ({ marker }) => {
  const latitude = marker.latitude
  const longitude = marker.longitude
  const zoom = 15
  const position = [latitude, longitude]
  const mapStyle = {
    height: '90vh',
    width: '90vw',
    border: '3px solid black',
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

  console.log('StaticMap marker', marker)
  console.log('StaticMap position', position)
  console.log('StaticMap zoom', zoom)

  return (
    <MapContainer
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
