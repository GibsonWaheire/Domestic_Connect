# Domestic Connect

A platform connecting employers with domestic workers and agencies.

## Features

- User authentication (employers, housegirls, agencies)
- Profile management for different user types
- Payment packages and contact access system
- Modern React + TypeScript + Tailwind CSS UI

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Database**: JSON Server (local development)
- **State Management**: React Context + React Query
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd domestic-connect
```

2. Install dependencies
```bash
npm install
```

3. Start the JSON Server database
```bash
npm run db
```

4. In a new terminal, start the development server
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Database Setup

The app uses JSON Server for local development. The database file (`db.json`) contains:

- **profiles**: User profile information
- **employer_profiles**: Employer-specific details
- **housegirl_profiles**: Domestic worker details
- **agency_profiles**: Agency information
- **payment_packages**: Available payment plans
- **user_purchases**: User purchase history
- **contact_access**: Contact access records

### Starting the Database Server

```bash
npm run db
```

This starts JSON Server on port 3001 with the `db.json` file.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and API
├── pages/              # Page components
└── integrations/       # External service integrations
```

## API Endpoints

All API endpoints are served through JSON Server at `http://localhost:3001`:

- `GET /profiles` - Get all profiles
- `POST /profiles` - Create a new profile
- `GET /employer_profiles` - Get employer profiles
- `GET /housegirl_profiles` - Get housegirl profiles
- `GET /agency_profiles` - Get agency profiles
- `GET /payment_packages` - Get payment packages
- And more...

## Authentication

The app uses local storage for user authentication in development. Users can:

- Sign up with email, password, and user type
- Sign in with existing credentials
- Sign out to clear session

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db` - Start JSON Server database
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Adding New Features

1. Update the API interfaces in `src/lib/api.ts`
2. Add new endpoints to the API functions
3. Update the database schema in `db.json`
4. Create new components and pages as needed

## Production Deployment

For production, you'll want to:

1. Replace JSON Server with a real database (PostgreSQL, MySQL, etc.)
2. Implement proper authentication (JWT, OAuth, etc.)
3. Set up environment variables for API endpoints
4. Configure CORS and security headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
