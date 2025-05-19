import { Plus, Minus } from 'lucide-react'
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
import { useEffect } from 'react'

import { collaboratorSchema, userRoles } from '@/utils/schemas'
import FormInput from './formComponents/FormInput'
import FormDropdown from './formComponents/FormDropdown'

const CollabDialogue = ({ project }) => {
  const collaborators = project.collaborators || []

  const form = useForm({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      email: '',
      role: 'viewer',
    },
  })

  const onSubmit = (data) => {
    console.log('Form data:', data)
    // Handle form submission logic here
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              defaultValue="viewer"
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
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
export default CollabDialogue
