import React from 'react'
import { useQuery } from '@apollo/client'
import { GET_SATELLITE_IMAGE, GET_LATEST_SATELLITE_IMAGE } from '@/queries'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar, CloudRain, Layers } from 'lucide-react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { parseDate, isValidDate } from '@/utils/helper'

const SatelliteImageViewer = ({
  projectId,
  selectedImageId,
  bandCombination = 'TRUE_COLOR',
  onBandCombinationChange,
}) => {
  // If selectedImageId is provided, get that specific image
  // Otherwise, get the latest image for the project
  const { loading, error, data } = useQuery(
    selectedImageId ? GET_SATELLITE_IMAGE : GET_LATEST_SATELLITE_IMAGE,
    {
      variables: selectedImageId
        ? { imageId: selectedImageId, projectId, bandCombination }
        : { projectId, bandCombination },
      fetchPolicy: 'cache-and-network',
    }
  )

  const image = selectedImageId
    ? data?.getSatelliteImage
    : data?.project?.latestSatelliteImage

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
        Error loading satellite image: {error.message}
      </div>
    )
  }

  if (!image) {
    return (
      <div className="p-4 border border-amber-300 bg-amber-50 text-amber-800 rounded-md">
        No satellite imagery available for this location.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {image.date && isValidDate(image.date)
              ? format(parseDate(image.date), 'PPP')
              : 'Unknown date'}
          </span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <CloudRain className="h-3 w-3" />
            {typeof image.cloudCoverage === 'number'
              ? `${Math.round(image.cloudCoverage)}% cloud cover`
              : 'Unknown cloud cover'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <Select
            value={bandCombination}
            onValueChange={onBandCombinationChange}
          >
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="True Color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TRUE_COLOR">True Color (RGB)</SelectItem>
              <SelectItem value="FALSE_COLOR">False Color (NIR)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Card className="overflow-hidden cursor-pointer hover:opacity-95 transition-opacity">
            <CardContent className="p-0">
              <div className="aspect-square w-full relative">
                <img
                  src={image.url}
                  alt={`Satellite image from ${
                    image.date && isValidDate(image.date)
                      ? format(parseDate(image.date), 'PPP')
                      : 'Unknown date'
                  }`}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
                <div className="absolute bottom-2 right-2">
                  <Badge className="bg-background/80 hover:bg-background/90 text-foreground">
                    Click to enlarge
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-screen-lg w-full p-0">
          <img
            src={image.url}
            alt={`Satellite image from ${
              image.date && isValidDate(image.date)
                ? format(parseDate(image.date), 'PPP')
                : 'Unknown date'
            }`}
            className="w-full h-auto"
          />
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Source: {image.source}</div>
        <div>Band Combination: {image.bandCombination}</div>
      </div>
    </div>
  )
}

export default SatelliteImageViewer
