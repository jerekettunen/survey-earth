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
  const map = useMapEvents({
    click: (event) => {
      const { lat, lng } = event.latlng
      setLocation([lat, lng])
      console.log('Map clicked at:', lat, lng)
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
      scrollWheelZoom={false}
      ref={mapRef}
      style={{ height: '90vh', width: '90vw', border: '3px solid black' }}
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
