import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { ADD_PROJECT } from '@/queries'
import { projectSchema, projectTypes } from '@/utils/schemas'
import MapView from './MapView'
import FormDatePick from './formComponents/FormDatePick'
import FormTextField from './formComponents/FormTextField'
import FormInput from './formComponents/FormInput'
import FormInputChange from './formComponents/FormInputChange'
import FormDropdown from './formComponents/FormDropdown'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

const NewProjectForm = () => {
  const [latitude, setLatitude] = useState(0)
  const [longitude, setLongitude] = useState(0)
  const [location, setLocation] = useState([latitude, longitude])
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
      startDate: '',
      endDate: '',
      type: projectTypes[0],
      latitude: 0,
      longitude: 0,
    },
  })

  useEffect(() => {
    form.setValue('latitude', location[0])
    form.setValue('longitude', location[1])
    setLatitude(location[0])
    setLongitude(location[1])
  }, [location])

  const onSubmit = (data) => {
    console.log('Form submitted:', data)
    const projectData = {
      name: data.name,
      description: data.description,
      latitude: location[0],
      longitude: location[1],
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
    }
    addProject({
      variables: projectData,
    })
    form.reset()
    setLatitude(0)
    setLongitude(0)
  }

  return (
    <div className="project-form">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            form={form}
            name="name"
            label="Project Name"
            placeholder="Enter project name"
            type="text"
          />
          <FormTextField
            form={form}
            name="description"
            label="Description"
            placeholder="Enter project description"
          />
          <div className="flex items-center justify-center space-x-4">
            <FormDatePick form={form} name="startDate" label="Start Date" />
            <FormDatePick form={form} name="endDate" label="End Date" />
          </div>
          <FormDropdown
            form={form}
            name="type"
            label="Project Type"
            options={projectTypes}
          />
          <div className="flex items-center justify-center space-x-4">
            <FormInputChange
              form={form}
              name="Latitude"
              label="Latitude"
              placeholder="Latitude"
              number={latitude}
              setter={setLatitude}
            />
            <FormInputChange
              form={form}
              name="Longitude"
              label="Longitude"
              placeholder="Longitude"
              number={longitude}
              setter={setLongitude}
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
