import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { GET_PROJECTS } from '@/queries'

const Projects = () => {
  const { loading, error, data } = useQuery(GET_PROJECTS, {
    fetchPolicy: 'cache-and-network',
  })

  if (loading) return <p>Loading...</p>

  const projects = data.projects
  console.log('Projects:', projects)

  return (
    <div className="flex flex-col items-center min-h-svh">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-gray-500">List of projects</p>
      </div>
      <div className="mt-4">
        <ul className="list-disc">
          <li>Project 1</li>
          <li>Project 2</li>
          <li>Project 3</li>
        </ul>
      </div>
    </div>
  )
}
export default Projects
