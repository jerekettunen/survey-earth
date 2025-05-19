import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Edit } from 'lucide-react'
import { Form } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@apollo/client'
import { UPDATE_PROJECT } from '@/queries'
import { useEffect } from 'react'

import { projectUpdateSchema } from '@/utils/schemas'
import { projectTypes } from '@/utils/schemas'
import FormDatePick from '../formComponents/FormDatePick'
import FormTextField from '../formComponents/FormTextField'
import FormInput from '../formComponents/FormInput'
import FormInputChange from '../formComponents/FormInputChange'
import FormDropdown from '../formComponents/FormDropdown'

const ProjectEditDialog = ({ project }) => {
  const [updateProject] = useMutation(UPDATE_PROJECT, {
    onError: (error) => {
      console.error('Error updating project:', error)
    },
    update: (cache, response) => {
      const updatedProject = response.data.updateProject
      cache.modify({
        id: cache.identify(updatedProject),
        fields: {
          name: () => updatedProject.name,
          description: () => updatedProject.description,
          type: () => updatedProject.type,
        },
      })
    },
  })

  const form = useForm({
    resolver: zodResolver(projectUpdateSchema),
    defaultValues: {
      name: project.name,
      description: project.description,
      type: project.type,
    },
  })

  useEffect(() => {}, [form.formState])

  const onSubmit = (data) => {
    const updateProjectData = {
      name: data.name,
      description: data.description,
      type: data.type,
    }
    updateProject({
      variables: {
        id: project.id,
        ...updateProjectData,
      },
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Edit className="cursor-pointer text-muted-foreground transition-colors hover:text-primary" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] z-1000">
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>
            Make changes to your project here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4">
              <FormInput
                form={form}
                name="name"
                label="Title"
                placeholder="Project title"
              />
              <FormTextField
                form={form}
                name="description"
                label="Description"
                placeholder="Project description"
              />
              <FormDropdown
                form={form}
                name="type"
                label="Project Type"
                options={projectTypes}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectEditDialog
