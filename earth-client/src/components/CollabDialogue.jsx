import { Plus, Minus, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

import { Form } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@apollo/client'
import { useToast } from '@/components/Providers/ToastProvider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ADD_COLLABORATOR, REMOVE_COLLABORATOR } from '@/queries'

import { collaboratorSchema, userRoles } from '@/utils/schemas'
import FormInput from './formComponents/FormInput'
import FormDropdown from './formComponents/FormDropdown'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const CollabDialogue = ({ project }) => {
  const collaborators = project.collaborators || []
  const { showSuccess, showError } = useToast()
  const [addCollaborator] = useMutation(ADD_COLLABORATOR, {
    onCompleted: (data) => {
      const collaborators = data.addCollaborator.collaborators || []

      if (collaborators.length > 0) {
        const newCollab = collaborators[collaborators.length - 1]
        const username = newCollab?.user?.username || 'Unknown user'

        showSuccess(
          'Collaborator added',
          `Added ${username} as a collaborator.`
        )
      } else {
        showSuccess(
          'Collaborator added',
          'Added new collaborator to the project.'
        )
      }
    },
    onError: (error) => {
      const errorMessage = error.message.includes('User not found')
        ? 'No user found with that email address'
        : error.message

      showError('Error adding collaborator', errorMessage)
    },
    update: (cache, { data }) => {
      const updatedProject = data.addCollaborator

      // Update the cache by directly writing the new project data
      cache.modify({
        id: cache.identify({ __typename: 'Project', id: project.id }),
        fields: {
          collaborators: () => {
            return updatedProject.collaborators
          },
        },
      })
    },
  })

  const [removeCollaborator] = useMutation(REMOVE_COLLABORATOR, {
    onCompleted: (data) => {
      showSuccess(
        'Collaborator removed',
        `Removed ${data.removeCollaborator.user.username} as a collaborator.`
      )
    },
    onError: (error) => {
      const errorMessage = error.message.includes('User not found')
        ? 'No user found with that email address'
        : error.message

      showError('Error removing collaborator', errorMessage)
    },
    update: (cache, { data }) => {
      const updatedProject = data.removeCollaborator

      // Update the cache with new collaborators list
      cache.modify({
        id: cache.identify({ __typename: 'Project', id: project.id }),
        fields: {
          collaborators: () => updatedProject.collaborators,
        },
      })
    },
  })

  const form = useForm({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      email: '',
      role: 'Viewer',
    },
  })

  const onSubmit = (data) => {
    addCollaborator({
      variables: {
        projectId: project.id,
        email: data.email,
        role: data.role,
      },
    })

    form.reset()
  }

  const handleRemove = (collabId) => {
    if (!collabId) {
      showError('Error removing collaborator', 'No user found with that ID')
      return
    }
    removeCollaborator({
      variables: {
        projectId: project.id,
        userId: collabId,
      },
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-50%" size="sm">
          Add Collaborators
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] z-1000">
        <DialogHeader>
          <DialogTitle>Add Collaborator</DialogTitle>
          <DialogDescription>
            Add a collaborator to your project.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </TabsTrigger>
            <TabsTrigger value="remove" className="w-full">
              <Minus className="mr-2 h-4 w-4" />
              Remove
            </TabsTrigger>
          </TabsList>
          <TabsContent value="add">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormInput
                  form={form}
                  name="email"
                  label="Email"
                  placeholder="Enter email"
                  type="email"
                  required
                />
                <FormDropdown
                  form={form}
                  name="role"
                  label="Role"
                  options={userRoles}
                  defaultValue="Viewer"
                  placeholder="Select role"
                  required
                />
                <div className="flex items-center justify-between mt-4">
                  <Button type="submit" className="w-full">
                    Add
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="remove">
            <div className="space-y-4">
              {collaborators.map((collab) => (
                <div
                  key={collab.user?.id}
                  className="flex items-center justify-between p-2 rounded-md border border-border bg-background"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {collab.user?.username || collab.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Role: {collab.role}
                    </span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          aria-label={`Remove ${collab.user?.username || 'collaborator'}`}
                          onClick={() => handleRemove(collab.user?.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove collaborator</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
              {collaborators.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No collaborators to remove
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
export default CollabDialogue
