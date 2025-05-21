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

## Development Timeline

### Phase 1: Project Setup & Research (May 3-7, 2025)

- Research, ideation, and technology selection
- Initial repository setup
- First client initialization
- **Hours:** ~20

### Phase 2: Core Functionality (May 8-10, 2025)

- Initial project form implementation
- Basic map functionality integration
- Location handling with latitude/longitude
- Server and database functionality
- Data table skeleton implementation
- **Hours:** ~25

### Phase 3: User Interface & Authentication (May 11-14, 2025)

- Single project view skeleton
- Login functionality implementation
- Table filtering capabilities
- UI styling and theme toggle
- Form field refactoring and date picker
- **Hours:** ~25

### Phase 4: Project Management (May 15-16, 2025)

- Signup page implementation
- Project page enhancements
- Single project layout and update functionality
- **Hours:** ~15

### Phase 5: UI Improvements & Collaboration (May 17-18, 2025)

- Sidebar functionality implementation
- Content component structuring
- Overall UI enhancements
- User levels and collaboration framework
- **Hours:** ~10

### Phase 6: Satellite Integration (May 18-19, 2025)

- Implementation of SentinelHub API integration
- Satellite imagery fetching and processing
- Cloud coverage filtering implementation
- Historical image timeline functionality
- **Hours:** ~15

### Phase 7: Finalization & Deployment (May 20-21, 2025)

- Project view updates
- Testing implementation
- CI/CD pipeline configuration
- Deployment automation
- Bug fixes (thumbnail issue, etc.)
- Final UI updates and optimizations
- **Hours:** ~15

**Total Development Hours:** ~125
**Research and learning time not accounted for but estimated to be additional:**60

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

## Use of AI in this project

### AI-Assisted Areas

- **UI Component Refinement**: AI helped improve styling and responsiveness of complex components like satellite image timeline and map views. All components were initially designed by me before seeking AI refinement. The landing page was especially helped with.

- **Testing**: AI was used to generate boilerplate based on previous written tests and give suggestions on trickier testing scenarios.

- **Debugging Assistance**: When encountering complex bugs, I used AI to analyze problems and suggest potential solutions.

- **Complex features**: AI was used as a pair programmer to find and suggest solution when writing more complex features to help gather information and knowledge and help with learning.

### Where AI Was Not Used

- **Core Architecture**: All system design decisions and architectural patterns were implemented independently.

- **Business Logic**: Critical application logic, especially project management and collaboration features, was written without AI assistance.

- **Data Models**: Database schemas and GraphQL types were designed based on my own.

- **Security Implementation**: Authentication flows and authorization checks were implemented manually based on course material and further research.

### Approach to AI Use

I approached AI as a learning tool rather than a solution generator, often asking for explanations of suggested code to deepen my understanding. This allowed to maintain full ownership of the codebase while leveraging AI to accelerate learning in areas with less experience, particularly satellite imagery processing and AWS deployment configurations.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Sentinel Hub for satellite imagery access
- React Leaflet for map implementation
- shadcn/ui for UI component inspiration

This project was developed as part of 'Full Stack open' from University of Helsinki during May 3-21, 2025.
