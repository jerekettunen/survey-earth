import React, { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { GET_AVAILABLE_IMAGES } from '@/queries'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { CloudRain, Search, Layers } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

import RetryImage from './RetryImage'

const SatelliteImageTimeline = ({
  projectId,
  selectedImageId,
  onImageSelect,
  bandCombination,
  onBandCombinationChange,
}) => {
  // Default to last 90 days
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 90).toISOString(),
    to: new Date().toISOString(),
  })

  const [cloudCoverageFilter, setCloudCoverageFilter] = useState(30)

  const { loading, error, data } = useQuery(GET_AVAILABLE_IMAGES, {
    variables: {
      projectId,
      from: dateRange.from,
      to: dateRange.to,
      maxCloudCoverage: cloudCoverageFilter,
    },
    fetchPolicy: 'cache-and-network',
  })

  // Auto-select the most recent image when data loads
  useEffect(() => {
    if (data?.getAvailableImagesForProject?.length && !selectedImageId) {
      const mostRecent = [...data.getAvailableImagesForProject].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      )[0]
      onImageSelect(mostRecent.id)
    }
  }, [data, selectedImageId, onImageSelect])

  const images = data?.getAvailableImagesForProject || []
  const sortedImages = [...images].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex items-end gap-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">From</label>
            <Input
              type="date"
              value={dateRange.from.split('T')[0]}
              onChange={(e) =>
                setDateRange((prev) => ({
                  ...prev,
                  from: new Date(e.target.value).toISOString(),
                }))
              }
              className="h-8"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <Input
              type="date"
              value={dateRange.to.split('T')[0]}
              onChange={(e) =>
                setDateRange((prev) => ({
                  ...prev,
                  to: new Date(e.target.value).toISOString(),
                }))
              }
              className="h-8"
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="flex gap-1 items-center"
          >
            <Search className="h-3 w-3" /> Search
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Max Cloud Coverage: {cloudCoverageFilter}%
            </span>
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

          <Slider
            defaultValue={[cloudCoverageFilter]}
            max={100}
            step={1}
            className="w-full"
            onValueChange={(values) => setCloudCoverageFilter(values[0])}
          />
        </div>
      </div>

      <Separator />

      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
          Error loading images: {error.message}
        </div>
      ) : sortedImages.length === 0 ? (
        <div className="p-4 border border-amber-300 bg-amber-50 text-amber-800 rounded-md">
          No images found for the selected criteria.
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            {sortedImages.length} images found
          </div>

          <ScrollArea className="h-64">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {sortedImages.map((image) => (
                <Card
                  key={image.id}
                  className={`overflow-hidden cursor-pointer transition-all ${
                    selectedImageId === image.id
                      ? 'ring-2 ring-primary'
                      : 'hover:ring-1 hover:ring-muted'
                  }`}
                  onClick={() => onImageSelect(image.id)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      <RetryImage
                        src={image.thumbnail || image.url}
                        alt={`Thumbnail from ${format(new Date(image.date), 'PP')}`}
                        className="object-cover w-full h-full"
                        fallbackSrc="/placeholder-thumbnail.svg"
                        maxRetries={4}
                        retryDelay={800}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white p-1">
                        <div className="text-xs flex items-center justify-between">
                          <span>{format(new Date(image.date), 'PP')}</span>
                          <span className="flex items-center">
                            <CloudRain className="h-3 w-3 mr-1" />
                            {Math.round(image.cloudCoverage)}%
                          </span>
                        </div>
                      </div>
                      {selectedImageId === image.id && (
                        <div className="absolute inset-0 bg-primary/20"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  )
}

export default SatelliteImageTimeline
