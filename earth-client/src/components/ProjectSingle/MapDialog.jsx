import {
  MapContainer,
  TileLayer,
  Marker,
  ZoomControl,
  Popup,
} from 'react-leaflet'
import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import { Button } from '@/components/ui/button'
import { Copy, MapPin, ZoomIn, ZoomOut, Compass } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

// Fix Leaflet icon issues in React
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
})
L.Marker.prototype.options.icon = DefaultIcon

const MapDialog = ({ marker, projectName }) => {
  const mapRef = useRef(null)
  const [open, setOpen] = useState(false)
  const latitude = marker?.latitude || 0
  const longitude = marker?.longitude || 0
  const [zoom, setZoom] = useState(15)
  const position = [latitude, longitude]

  // Copy coordinates to clipboard
  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${latitude}, ${longitude}`)
  }

  const dialogMapStyle = {
    height: '60vh',
    width: '100%',
    borderRadius: '0.5rem',
  }

  // The small map preview style
  const previewMapStyle = {
    height: '100%',
    width: '100%',
    borderRadius: 'inherit',
    cursor: 'pointer',
  }

  // Handle map resize when dialog opens
  useEffect(() => {
    if (open && mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize()
        mapRef.current.setView(position, zoom)
      }, 300)
    }
  }, [open, position, zoom])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="rounded-md overflow-hidden border h-[250px] relative cursor-pointer hover:opacity-90 transition-opacity">
          {/* Only render MapContainer if we have valid coordinates */}
          {latitude && longitude ? (
            <MapContainer
              center={position}
              zoom={12}
              style={previewMapStyle}
              zoomControl={false}
              attributionControl={false}
              dragging={false}
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position} />
              <div className="absolute bottom-2 right-2 z-[1000]">
                <Badge
                  variant="secondary"
                  className="backdrop-blur-sm bg-white/60 dark:bg-black/60"
                >
                  <ZoomIn className="w-4 h-4 mr-1" /> Expand
                </Badge>
              </div>
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <p className="text-muted-foreground">
                No location data available
              </p>
            </div>
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px] max-h-[90vh] z-[1000]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            {projectName || 'Location'} Map View
          </DialogTitle>
          <DialogDescription>
            Interactive map showing the project location.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md overflow-hidden border">
          {latitude && longitude ? (
            <MapContainer
              ref={mapRef}
              center={position}
              zoom={zoom}
              style={dialogMapStyle}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                {/* Replace L.Popup with React-Leaflet's Popup */}
                <Popup>
                  <strong>{projectName || 'Project location'}</strong>
                  <br />
                  Lat: {latitude.toFixed(6)}
                  <br />
                  Long: {longitude.toFixed(6)}
                </Popup>
              </Marker>
              <ZoomControl position="bottomright" />
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-[60vh] bg-muted">
              <p className="text-muted-foreground">
                No location data available
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm text-muted-foreground mb-1">Coordinates</p>
            <div className="flex items-center gap-2">
              <div className="font-mono text-sm bg-muted p-2 rounded flex-1 overflow-x-auto whitespace-nowrap">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyCoordinates}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy coordinates</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex gap-2 ml-auto">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MapDialog
