import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { ADD_PROJECT } from '@/queries'
import { projectSchema } from '@/utils/schemas'
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

const NewProjectForm = () => {
  const [location, setLocation] = useState([0, 0])
  const [addProject] = useMutation(ADD_PROJECT, {
    onError: (error) => {
      console.error('Error creating project:', error)
    },
  })

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
    const projectData = {
      name: data.name,
      description: data.description,
      latitude: location[0],
      longitude: location[1],
    }

    addProject({
      variables: projectData,
    })
    form.reset()
    setLocation([0, 0])
  }

  return (
    <div className="project-form">
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
          <div className="flex items-center justify-between">
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
          </div>
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
