# ChatApp Vercel-D

## Project Overview

ChatApp Vercel-D is a full-stack chat application built with Next.js, utilizing a monorepo structure managed by Turborepo. The application consists of a frontend for user interactions and a backend for handling API requests and database operations.

## Repository Structure

```
chatapp-vercel-d/
├── apps/
│   ├── backend/
│   │   ├── pages/
│   │   │   └── api/
│   │   ├── types/
│   │   ├── utility/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── BACKEND.md
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   └── utilities/
│       ├── package.json
│       ├── tsconfig.json
│       └── FRONTEND.md
├── package.json
├── tsconfig.json
└── turbo.json
```

## Documentation

- For detailed frontend documentation, please refer to [FRONTEND.md](apps/frontend/FRONTEND.md)
- For detailed backend documentation, please refer to [BACKEND.md](apps/backend/BACKEND.md)

## Setup Instructions

1. Clone the repository:
   ```
   git clone [repository-url]
   cd chatapp-vercel-d
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in both `apps/frontend` and `apps/backend` directories.
   - Add necessary environment variables (see Environment Variables section below).

4. Run the development server:
   ```
   npm run dev
   ```

## Quick Overview

### Frontend

- **Technologies**: Next.js 13.5.2, React 18.2.0, TypeScript, Pusher.js, Notyf, Font Awesome
- **Key Components**: Chat, ConversationList, FewShotForm, FileUploadForm, SearchForm
- **Utilities**: config.js, fetchWithAuth.ts

For more details, see [FRONTEND.md](apps/frontend/FRONTEND.md).

### Backend

- **Technologies**: Next.js 13.5.2 (API Routes), MongoDB, Pusher, JSON Web Tokens (JWT)
- **Key API Endpoints**: add_few_shot_example, get_config, list_conversations, send_message, etc.
- **Utilities**: auth.ts, azure.ts, helpers.ts, mongodb.ts, pusher.ts

For more details, see [BACKEND.md](apps/backend/BACKEND.md).

## Development Workflow

1. Start the development servers:
   ```
   npm run dev
   ```
   This will start both frontend and backend servers concurrently.

2. Frontend development:
   - Work on components in `apps/frontend/src/components/`
   - Update pages in `apps/frontend/src/pages/`
   - Add new utilities in `apps/frontend/src/utilities/`

3. Backend development:
   - Add or modify API routes in `apps/backend/pages/api/`
   - Update utility functions in `apps/backend/utility/`

4. Run linters:
   ```
   npm run lint
   ```

5. Run tests:
   ```
   npm run test
   ```

## Deployment

This project is configured for deployment on Vercel.

1. Push your changes to the connected Git repository.
2. Vercel will automatically detect the pushed changes and start the deployment process.
3. Ensure all necessary environment variables are set in the Vercel project settings.

## Environment Variables

### Frontend (.env.local in apps/frontend)
- `NEXT_PUBLIC_API_URL`: URL of the backend API
- `NEXT_PUBLIC_PUSHER_KEY`: Pusher public key
- `NEXT_PUBLIC_PUSHER_CLUSTER`: Pusher cluster

### Backend (.env.local in apps/backend)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT signing
- `PUSHER_APP_ID`: Pusher app ID
- `PUSHER_KEY`: Pusher key
- `PUSHER_SECRET`: Pusher secret
- `PUSHER_CLUSTER`: Pusher cluster

Note: Ensure these environment variables are also set in your Vercel project settings for production deployment.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.