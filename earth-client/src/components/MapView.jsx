import React, { useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const MapClickHandler = () => {
  const map = useMapEvents({
    click: (event) => {
      const { lat, lng } = event.latlng
      console.log('Map clicked at:', lat, lng)
    },
  })

  return null
}

const MapView = () => {
  const mapRef = useRef(null)
  const latitude = 51.505
  const longitude = -0.09

  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng
    console.log('Map clicked at:', lat, lng)
  }

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      ref={mapRef}
      style={{ height: '50vh', width: '50vw', minHeight: '30rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[51.505, -0.09]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
      <MapClickHandler />
    </MapContainer>
  )
}

export default MapView
