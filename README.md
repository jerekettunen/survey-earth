# Earth.Project - Satellite Monitoring Platform

A web application for monitoring Earth's surface through satellite imagery. This platform enables researchers, environmental analysts, and organizations to track changes in specific locations over time using satellite data.

## Overview

Earth.Project allows users to create monitoring projects for specific geographical areas, access high-resolution satellite imagery, and analyze changes over time. The platform supports collaboration, various visualization options, and detailed timeline views for comprehensive environmental monitoring.

## Tech Stack

### Frontend

- **Framework**: React 19 with functional components and hooks
- **Build Tool**: Vite
- **Routing**: React Router
- **Map Integration**: Leaflet/React-Leaflet
- **Form Handling**: React Hook Form with Zod validation
- **Testing**: Vitests

### Backend

- **Runtime**: Node.js with Express
- **API**: GraphQL with Apollo Server
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based auth flow
- **External APIs**: Sentinel Hub for satellite imagery
- **Testing**: Jest

### Infrastructure

- **Hosting**: AWS (S3, CloudFront, Lambda)
- **CI/CD**: GitHub Actions

## Features

- **Project Management**: Create, edit, and organize monitoring projects
- **Interactive Maps**: Select monitoring locations using interactive maps
- **Satellite Imagery**: Access and visualize Sentinel-2 satellite imagery
- **Multiple Visualizations**: Switch between true color and false color band combinations
- **Timeline View**: Browse historical images to detect changes over time
- **Cloud Coverage Filtering**: Filter images based on cloud percentage
- **Collaboration**: Invite team members to projects with different roles
- **Responsive Design**: Functional on both desktop and mobile

## Installation

### Prerequisites

- Node.js 18 or higher
- MongoDB 5.0+
- Sentinel Hub account with API access

### Setup

1. Clone the repository
2. Install dependencies for both server and client
3. Create environment files
4. Start development servers

## Deployment

The application is deployed using AWS services:

- **Frontend**: S3 + CloudFront
- **Backend**: Lambda + API Gateway
- **Database**: MongoDB Atlas

Deployment is automated via GitHub Actions which builds, tests, and deploys changes when code is pushed to the main branch.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Sentinel Hub for satellite imagery access
- React Leaflet for map implementation
- shadcn/ui for UI component inspiration

This project was developed as part of 'Full Stack open' from University of Helsinki during May 3-21, 2025.
