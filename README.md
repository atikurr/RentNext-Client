# RentNest — Frontend

RentNest is a modern **Property Rental & Booking Platform** designed to connect property owners with tenants. The frontend provides a responsive user interface for browsing rental properties, managing listings, handling bookings, and accessing role-based dashboards.

## Live Demo

**Frontend:** https://rent-next-client.vercel.app/

**Backend API:** Add your deployed backend URL here.

## Project Overview

RentNest simplifies the property rental process through an intuitive and responsive web application. Users can explore property listings, view property details, and access features based on their assigned roles.

The application includes dedicated dashboard experiences for administrators, property owners, and tenants.

## Features

- Responsive and modern user interface
- Property browsing and property details
- Property search and filtering
- User authentication
- Role-based dashboards
- Admin dashboard for administrative operations
- Owner dashboard for managing property listings
- Tenant dashboard for rental and booking activities
- Booking-related functionality
- Property listing management
- Dashboard analytics and data visualization
- Light and dark theme support
- API integration with the RentNest backend
- Interactive UI components and notifications

> The listed features should reflect the functionality implemented in the submitted version of the project.

## Technology Stack

- **Framework:** Next.js
- **Library:** React
- **Language:** JavaScript / JSX
- **Styling:** Tailwind CSS
- **Authentication:** Project-configured authentication client
- **Icons:** Lucide React
- **Charts:** Recharts
- **UI Components:** Reusable React components
- **Deployment:** Vercel

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Git

### Installation

Clone the frontend repository:

```bash
git clone YOUR_FRONTEND_GITHUB_REPOSITORY_URL
```

Navigate to the project directory:

```bash
cd YOUR_FRONTEND_FOLDER
```

Install the dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the frontend root directory.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Replace the URL with your actual backend URL when configuring the production environment.

Add only the environment variables required by your application. Never expose private API keys, database credentials, or authentication secrets in frontend environment variables.

### Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

### Build for Production

Create a production build:

```bash
npm run build
```

Start the production server locally:

```bash
npm start
```

## Application Routes

The application includes role-based dashboard areas, including:

| Route | Purpose |
|---|---|
| `/` | Home page |
| `/dashboard/admin` | Admin dashboard |
| `/dashboard/owner` | Property owner dashboard |
| `/dashboard/tenant` | Tenant dashboard |

Additional property, authentication, and booking routes depend on the implemented application structure.

## Backend Integration

The frontend communicates with the RentNest backend API to retrieve and manage application data.

**Local API URL:**

```text
http://localhost:5000
```

**Production API URL:** Configure the deployed backend URL through `NEXT_PUBLIC_API_URL`.

Ensure the backend CORS configuration permits requests from the frontend domain.

## Deployment

The frontend is deployed using Vercel.

To deploy your own version:

1. Push the frontend source code to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables.
4. Deploy the application.
5. Verify that the frontend connects successfully to the production backend.
6. Test authentication, property listings, and dashboard functionality.

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── admin/
│   │   │   ├── owner/
│   │   │   └── tenant/
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── components/
│   └── lib/
├── .env.local
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

*This is a representative structure. Keep the actual folders and filenames consistent with your repository.*

## Security

- Do not commit `.env.local` to GitHub.
- Protect restricted dashboard routes with appropriate authentication and authorization.
- Keep private credentials on the server.
- Configure the correct production API URL.
- Validate sensitive operations on the backend.

## Academic Project Information

- **Project Name:** RentNest
- **Project Type:** Property Rental & Booking Platform
- **Project Component:** Frontend Web Application
- **Framework:** Next.js
- **Deployment Platform:** Vercel
- **Live URL:** https://rent-next-client.vercel.app/

## License

Developed for academic assignment purposes. Add a license if required by the project submission guidelines.