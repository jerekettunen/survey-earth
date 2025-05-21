import React, { useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const MapClickHandler = ({ setLocation, location }) => {
  useMapEvents({
    click: (event) => {
      const { lat, lng } = event.latlng
      setLocation([lat, lng])
    },
  })

  if (location) {
    return (
      <Marker position={location}>
        <Popup>
          You clicked here: {location ? location.join(', ') : 'Click to set'}
        </Popup>
      </Marker>
    )
  } else {
    return null
  }
}

const MapView = ({ setLocation, location }) => {
  const mapRef = useRef(null)
  const latitude = 64.61322
  const longitude = 26.9488

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={6}
      ref={mapRef}
      style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler setLocation={setLocation} location={location} />
    </MapContainer>
  )
}

export default MapView
