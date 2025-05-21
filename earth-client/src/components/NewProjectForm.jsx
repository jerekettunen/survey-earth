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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { MapPin, Calendar, FileText, Tag } from 'lucide-react'

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-2">
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>
            Fill out the form below to create a new Earth monitoring project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <FileText size={18} />
                  <h3 className="text-lg font-medium">Project Details</h3>
                </div>

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

                <FormDropdown
                  form={form}
                  name="type"
                  label="Project Type"
                  options={projectTypes}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Calendar size={18} />
                  <h3 className="text-lg font-medium">Timeline</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormDatePick
                    form={form}
                    name="startDate"
                    label="Start Date"
                  />
                  <FormDatePick form={form} name="endDate" label="End Date" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <MapPin size={18} />
                  <h3 className="text-lg font-medium">Location</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
              </div>

              <Button type="submit" className="w-full">
                Create Project
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Location
          </CardTitle>
          <CardDescription>
            Click on the map to set your project's location
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <div className="h-[500px] rounded-md overflow-hidden">
            <MapView setLocation={setLocation} location={location} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NewProjectForm
