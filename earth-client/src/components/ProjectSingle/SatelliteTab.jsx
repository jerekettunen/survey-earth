import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Satellite, Image, Calendar } from 'lucide-react'
import SatelliteImageViewer from './SatelliteImageViewer'
import SatelliteImageTimeline from './SatelliteImageTimeline'

const SatelliteTab = ({ projectId }) => {
  const [selectedImageId, setSelectedImageId] = useState(null)
  const [bandCombination, setBandCombination] = useState('TRUE_COLOR')

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite size={18} />
            Satellite Imagery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="view" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view" className="flex items-center gap-2">
                <Image className="h-4 w-4" /> Current View
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Timeline
              </TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="mt-4">
              <SatelliteImageViewer
                projectId={projectId}
                selectedImageId={selectedImageId}
                bandCombination={bandCombination}
                onBandCombinationChange={setBandCombination}
              />
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <SatelliteImageTimeline
                projectId={projectId}
                selectedImageId={selectedImageId}
                onImageSelect={setSelectedImageId}
                bandCombination={bandCombination}
                onBandCombinationChange={setBandCombination}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default SatelliteTab
