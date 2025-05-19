import { useQuery, useMutation } from '@apollo/client'
import { GET_PROJECT, DELETE_PROJECT } from '../../queries'
import { useNavigate } from 'react-router-dom'
import MapDialog from './MapDialog'
import ProjectEditDialog from './ProjectEditDialog'
import CollabDialogue from '../CollabDialogue'
import DeleteAlert from './DeleteAlert'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  MapPin,
  Clock,
  FileText,
  Users,
  Shield,
  Delete,
} from 'lucide-react'
import { formatDate } from '@/utils/helper'
import { useProjectRole } from '../Providers/ProjectRoleProvider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/components/Providers/ToastProvider'

const ProjectSingle = ({ id }) => {
  // Get role-based permissions
  const { can, userRole, isOwner, loading: roleLoading } = useProjectRole()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const { loading, error, data } = useQuery(GET_PROJECT, {
    variables: { id },
  })
  const [deleteProject] = useMutation(DELETE_PROJECT, {
    variables: { id },
    onCompleted: () => {
      showSuccess(
        'Project deleted',
        'The project has been deleted successfully.'
      )
      navigate('/projects')
    },
    onError: (error) => {
      showError('Error deleting project', error.message)
    },
    update: (cache) => {
      // Update the cache to remove the deleted project
      cache.modify({
        fields: {
          projects(existingProjects = [], { readField }) {
            return existingProjects.filter(
              (projectRef) => id !== readField('id', projectRef)
            )
          },
        },
      })
    },
  })

  if (loading || roleLoading)
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

  // Helper to get role display name
  const getRoleBadgeVariant = () => {
    if (isOwner) return 'default'
    switch (userRole) {
      case 'admin':
        return 'destructive'
      case 'editor':
        return 'secondary'
      case 'viewer':
        return 'outline'
      default:
        return 'outline'
    }
  }
  const handleDelete = () => {
    deleteProject({
      variables: { id: project.id },
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-sm">
              {project.type}
            </Badge>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant={getRoleBadgeVariant()} className="text-sm">
                    <Shield size={12} className="mr-1" />
                    {isOwner ? 'Owner' : userRole}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Your access level in this project
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex gap-2">
          {can.edit && <ProjectEditDialog project={project} />}

          {can.manage && <CollabDialogue project={project} />}
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
              <MapDialog
                marker={{
                  latitude: project.latitude,
                  longitude: project.longitude,
                }}
                projectName={project.name}
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
        </Card>
      </div>

      {can.delete && (
        <div className="border-t pt-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Danger Zone</h2>
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md p-4">
            <h3 className="font-medium text-red-800 dark:text-red-400">
              Delete Project
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              This action is permanent and cannot be undone.
            </p>
            <DeleteAlert
              deleteProject={deleteProject}
              projectName={project.name}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectSingle
