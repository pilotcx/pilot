# Tower - Team Management & Collaboration Software

Tower is a comprehensive team management and collaboration platform built with Next.js. It provides a unified solution for team communication, task management, project tracking, and more.

## Features

- **Team Collaboration** - Streamline communication, task assignment, and project tracking in one unified platform
- **Task Management** - Manage tasks with both list and Kanban board views
- **OKR Tracking** - Set and track Objectives and Key Results for your teams
- **Knowledge Base** - Centralized documentation and resource management
- **GitLab Integration** - Connect directly with GitLab to manage repositories, merge requests, and track development progress
- **Real-time Updates** - Stay informed with real-time notifications and project status updates across your entire team
- **Multi-team Support** - Manage multiple teams with different roles and permissions
- **Organization Setup** - Customize your organization structure, size, and permissions

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS, Lucide React icons
- **State Management**: Redux Toolkit, React Query
- **Authentication**: NextAuth.js, JWT
- **Database**: MongoDB with Mongoose
- **Editor**: TipTap for rich text editing
- **Notifications**: Sonner for toast notifications
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn package manager
- MongoDB database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/tower.git
cd tower
```

2. Install dependencies:

```bash
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Optional: OAuth providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. Run the development server:

```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
tower/
├── .github/           # GitHub Actions workflows
├── public/            # Static assets
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions, services, and types
│   │   ├── db/        # Database connection and models
│   │   ├── services/  # Business logic services
│   │   ├── types/     # TypeScript type definitions
│   │   ├── utils/     # Helper utilities
│   │   └── validations/ # Zod validation schemas
```

## Docker Deployment

This project includes Docker and Docker Compose support for easy deployment. You can either pull the pre-built image from GitHub Container Registry or build it yourself.

### Option 1: Pull Pre-built Image

```bash
# Pull the latest image from GitHub Container Registry
docker pull ghcr.io/monokaijs/tower:latest

# Run the container
docker run -p 3000:3000 -e MONGO_URI=your_mongodb_uri -e NEXTAUTH_SECRET=your_secret -e NEXTAUTH_URL=http://localhost:3000 ghcr.io/monokaijs/tower:latest
```

### Option 2: Docker Compose Setup (Recommended)

The Docker Compose setup includes the Next.js application (pulled from GitHub Container Registry), MongoDB, and MongoDB Express admin interface.

1. Clone this repository or download the docker-compose.yml file:

```bash
# If cloning the repository
git clone https://github.com/monokaijs/tower.git
cd tower

# Or if you just want the docker-compose.yml file
curl -O https://raw.githubusercontent.com/monokaijs/tower/main/docker-compose.yml
```

2. Start all services:

```bash
docker-compose up -d
```

3. Access the application at http://localhost:3000 and MongoDB Express admin at http://localhost:8081

### Configuration

The Docker Compose setup includes the following services:

- **App**: Next.js application running on port 3000
- **MongoDB**: Database running on port 27017 with data persistence
- **MongoDB Express**: Admin interface running on port 8081

### Common Docker Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Rebuild and restart the app after code changes
docker-compose build app
docker-compose up -d
```

### Production Deployment

For production, it's recommended to:

1. Enable MongoDB authentication in docker-compose.yml
2. Use a strong NEXTAUTH_SECRET
3. Set up HTTPS with a proper domain in NEXTAUTH_URL
4. Consider using a reverse proxy like Nginx

## GitHub Actions

The project includes a GitHub Actions workflow for continuous integration and deployment:

- Automatically builds and pushes Docker images to GitHub Container Registry
- Runs on pushes to the main branch, pull requests, or manual triggers
- No additional secrets required - uses GitHub's built-in GITHUB_TOKEN

To use the GitHub Container Registry images:

1. Make sure you have access to the repository
2. Pull the image: `docker pull ghcr.io/monokaijs/tower:latest`
3. Run it with the required environment variables

## Development

### Available Scripts

- `yarn dev` - Run the development server with Turbopack
- `yarn build` - Build the application for production
- `yarn start` - Start the production server
- `yarn lint` - Run ESLint to check for code issues

### Adding a New Feature

1. Create a new branch from `main`
2. Implement your feature
3. Write tests if applicable
4. Submit a pull request

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
