import { useQuery } from '@apollo/client'
import { GET_PROJECT } from '../../queries'
import StaticMap from '../StaticMap'
import ProjectEditDialog from './ProjectEditDialog'
import CollabDialogue from '../CollabDialogue'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, FileText, Users } from 'lucide-react'
import { formatDate } from '@/utils/helper'

const ProjectSingle = ({ id }) => {
  const { loading, error, data } = useQuery(GET_PROJECT, {
    variables: { id },
  })

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  if (error)
    return (
      <div className="p-4 text-red-500 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/20">
        Error: {error.message}
      </div>
    )
  if (!data || !data.project)
    return (
      <div className="p-4 text-amber-500 border border-amber-200 rounded-md bg-amber-50 dark:bg-amber-900/20">
        No project found
      </div>
    )

  const { project } = data
  const formattedStartDate = formatDate(project.startDate)
  const formattedEndDate = formatDate(project.endDate)
  const formattedCreatedAt = formatDate(project.createdAt)
  console.log(
    'Raw createdAt:',
    project.createdAt,
    'Formatted:',
    formattedCreatedAt
  )

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          <Badge variant="outline" className="text-sm">
            {project.type}
          </Badge>
        </div>
        <div className="flex gap-2">
          <ProjectEditDialog project={project} />
          <CollabDialogue project={project} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={18} />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose dark:prose-invert">
              <p>{project.description || 'No description provided'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={16} />
                <span>Started: {formattedStartDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={16} />
                <span>Ends: {formattedEndDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} />
                <span>Created: {formattedCreatedAt}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users size={16} />
                <span>Collaborators: {project.collaborators?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin size={18} />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md overflow-hidden border h-[250px]">
              <StaticMap
                marker={{
                  latitude: project.latitude,
                  longitude: project.longitude,
                }}
              />
            </div>
            <div className="flex justify-between mt-4 text-sm">
              <div>
                Latitude:{' '}
                <span className="font-mono">{project.latitude.toFixed(6)}</span>
              </div>
              <div>
                Longitude:{' '}
                <span className="font-mono">
                  {project.longitude.toFixed(6)}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              <MapPin size={16} className="mr-2" />
              View in full map
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default ProjectSingle
