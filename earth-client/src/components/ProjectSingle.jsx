import { useQuery } from '@apollo/client'
import { GET_PROJECT } from '../queries'
import StaticMap from './StaticMap'

const ProjectSingle = ({ id }) => {
  const { loading, error, data } = useQuery(GET_PROJECT, {
    variables: { id },
  })
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>
  if (!data || !data.project) return <p>No project found</p>
  const { project } = data

  return (
    <div>
      <div>
        <h2>{project.name}</h2>
        <p>{project.description}</p>
        <p>Latitude: {project.latitude}</p>
        <p>Longitude: {project.longitude}</p>
        <p>Type: {project.type}</p>
        <p>Start Date: {project.startDate}</p>
        <p>End Date: {project.endDate}</p>
        <p>Created At: {project.createdAt}</p>
      </div>
      <div>
        <StaticMap
          marker={{
            latitude: project.latitude,
            longitude: project.longitude,
          }}
        />
      </div>
    </div>
  )
}
export default ProjectSingle
