import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import MapView from './MapView'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const projectSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Project name is required' })
    .max(50, { message: 'Project name must be 50 characters or less' }),
  description: z
    .string()
    .min(1, { message: 'Project description is required' })
    .max(200, { message: 'Project description must be 200 characters or less' })
    .optional(),
  latitude: z
    .number()
    .min(-90, { message: 'Latitude must be between -90 and 90' })
    .max(90, { message: 'Latitude must be between -90 and 90' }),
  longitude: z
    .number()
    .min(-180, { message: 'Longitude must be between -180 and 180' })
    .max(180, { message: 'Longitude must be between -180 and 180' }),
})

const NewProjectForm = () => {
  const [location, setLocation] = useState([0, 0])

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      latitude: 0,
      longitude: 0,
    },
  })

  useEffect(() => {
    form.setValue('latitude', location[0])
    form.setValue('longitude', location[1])
  }, [location, form])

  const onSubmit = (data) => {
    console.log('Form submitted:', data)
  }

  return (
    <div className="flex flex-col items-center min-h-screen max-w-md mx-auto p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter project name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter project description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Latitude"
                    type="number"
                    {...field}
                    value={location[0]}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      if (!isNaN(value)) {
                        setLocation([value, location[1]])
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Longitude"
                    type="number"
                    {...field}
                    value={location[1]}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      if (!isNaN(value)) {
                        setLocation([location[0], value])
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Create Project</Button>
        </form>
      </Form>
      <div>
        <MapView setLocation={setLocation} location={location} />
      </div>
    </div>
  )
}

export default NewProjectForm
