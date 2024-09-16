# ChatApp Vercel-D

[![ChatApp Logo](link-to-logo.png)](link-to-project-website) 

**Build a powerful and scalable chat application with real-time updates, AI-powered responses, and seamless integration with Azure OpenAI Service.**

## Key Features

- **Real-time Chat:** Provide instant messaging capabilities using Pusher for seamless communication.
- **AI-Powered Responses:** Integrate intelligent responses using Azure OpenAI Service to engage users.
- **Persistent Conversations:** Store and retrieve conversation history in MongoDB for continuity.
- **Customizable AI (Optional):**  Fine-tune AI behavior with few-shot learning for tailored responses.
- **File Analysis:**  Enable users to upload files for analysis (implementation details can be customized).
- **Conversation Search:** Allow users to easily search through past conversations.
- **Easy Deployment:** Deploy effortlessly to Vercel with automatic build and deployment processes.

## Screenshots

(Optional: Include 1-2 compelling screenshots of your application here)

## Documentation

For more detailed information on the frontend and backend implementations, please refer to the following documentation:

- **Frontend Documentation:** [FRONTEND.md](FRONTEND.md)
- **Backend Documentation:** [BACKEND.md](BACKEND.md)

## Setup Instructions

**1. Clone the repository:**

```bash
git clone [repository-url]
cd chatapp-vercel-d
```

**2. Install dependencies:**

```bash
npm install
```

**3. Set up environment variables:**

- Create a `.env.local` file in both the `apps/frontend` and `apps/backend` directories.
- Add the necessary environment variables (see the "Environment Variables" section below).

**4. Run the development server:**

```bash
npm run dev
```

This will start both the frontend and backend servers concurrently with hot reloading. You should see the chat application running in your browser at `http://localhost:3000`.

## Development Workflow

- **Start Development Servers:** `npm run dev` (starts both frontend and backend servers with hot reloading).
- **Frontend Development:** Make changes in the `apps/frontend/src` directory.
- **Backend Development:** Modify API routes in `apps/backend/pages/api` or utility functions in `apps/backend/utility`.
- **Run Linters:** `npm run lint` (ensures code quality and consistency).
- **Run Tests:** `npm run test` (executes unit and integration tests).

## Deployment

This project is configured for deployment on Vercel.

1. **Push your changes to the connected Git repository.**
2. **Vercel will automatically detect the pushed changes and start the deployment process.**
3. **Ensure all necessary environment variables are set in the Vercel project settings.**

## Environment Variables

### Frontend (.env.local in apps/frontend)

- `NEXT_PUBLIC_API_BASE_URL`: URL of the backend API
- `NEXT_PUBLIC_PUSHER_KEY`: Pusher public key
- `NEXT_PUBLIC_PUSHER_CLUSTER`: Pusher cluster

### Backend (.env.local in apps/backend)

- `AZURE_API_URL`: Base URL for Azure OpenAI Service
- `AZURE_API_KEY`: API key for Azure OpenAI Service
- `AZURE_DEPLOYMENT_NAME`: Deployment name for Azure OpenAI Service
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB_NAME`: Name of the MongoDB database
- `JWT_SECRET`: Secret for JWT signing (if using authentication)
- `PUSHER_APP_ID`: Pusher app ID
- `PUSHER_KEY`: Pusher key
- `PUSHER_SECRET`: Pusher secret
- `PUSHER_CLUSTER`: Pusher cluster
- `MAX_FILE_SIZE_MB`: Maximum allowed file size for uploads (in MB)
- `ALLOWED_EXTENSIONS`: Comma-separated list of allowed file extensions for uploads

**Note:** Ensure these environment variables are also set in your Vercel project settings for production deployment.

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License. 
