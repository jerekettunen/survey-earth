import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { GET_PROJECTS } from '@/queries'
import DataTable from './DataTable'
import { columns } from './Columns'

const Projects = () => {
  const { loading, error, data } = useQuery(GET_PROJECTS, {
    fetchPolicy: 'cache-and-network',
  })

  if (loading) return <p>Loading...</p>

  const projects = data.projects

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      {error ? (
        <p>Error: {error.message}</p>
      ) : (
        <DataTable columns={columns} data={projects} />
      )}
    </div>
  )
}
export default Projects
