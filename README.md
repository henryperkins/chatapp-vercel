# ChatApp Vercel-D

Welcome to **ChatApp Vercel-D**, a chat application designed to replicate the AI21 Studio chat interface. This project includes both frontend and backend applications built with **Next.js** and **TypeScript**, managed within a monorepo using **Turborepo**. The application integrates with external services such as the **Azure OpenAI Service** for AI-generated responses, **Pusher** for real-time communication, and **MongoDB Atlas** for data storage.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Applications](#running-the-applications)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [External Services Integration](#external-services-integration)
- [Deployment](#deployment)
- [Advanced Development](#advanced-development)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Interactive Chat Interface**: Real-time messaging with AI assistant responses.
- **Few-Shot Learning**: Add few-shot examples to influence the AI assistant.
- **File Upload and Analysis**: Upload files for content analysis by the AI assistant.
- **Conversation History**: View and load past conversations.
- **Search Functionality**: Search through conversations.
- **Responsive Design**: Optimized for both desktop and mobile devices.

---

## Architecture

The project uses a monorepo structure managed by **Turborepo**, containing both frontend and backend applications.

### Monorepo Structure

```
chatapp-vercel-d/
├── apps/
│   ├── frontend/
│   └── backend/
├── packages/ (optional shared code)
├── .gitignore
├── package.json
├── turbo.json
```

- **`apps/frontend/`**: Frontend Next.js application.
- **`apps/backend/`**: Backend Next.js application with API routes.
- **`packages/`**: (Optional) Shared libraries or utilities.

---

## Getting Started

### Prerequisites

- **Node.js**: Version 14.17.0 or higher.
- **npm**: Package manager.
- **Git**: Version control system.
- **MongoDB Atlas Account**: For database storage.
- **Azure OpenAI Service Access**: For AI-generated responses.
- **Pusher Account**: For real-time communication.
- **Vercel Account**: For deployment (optional).

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/henryperkins/chatapp-vercel-d.git
   cd chatapp-vercel-d
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

   This command installs dependencies for both frontend and backend applications due to the monorepo setup.

### Environment Variables

Create `.env.local` files for both frontend and backend applications with the required environment variables.

#### Frontend (`apps/frontend/.env.local`):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
```

#### Backend (`apps/backend/.env.local`):

```env
AZURE_API_URL=your_azure_api_url
API_KEY=your_azure_api_key
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
MAX_TOKENS=128000
REPLY_TOKENS=800
CHUNK_SIZE_TOKENS=1000
MAX_FILE_SIZE_MB=5.0
ALLOWED_EXTENSIONS=txt,md,json
ALLOWED_ORIGINS=http://localhost:3000
```

> **Important**: Do not commit `.env.local` files or any credentials to version control. Ensure these variables are also set in your deployment environment.

### Running the Applications

1. **Start the Backend Application**:

   ```bash
   cd apps/backend
   npm run dev
   ```

   The backend server runs on `http://localhost:4000`.

2. **Start the Frontend Application**:

   Open a new terminal:

   ```bash
   cd apps/frontend
   npm run dev
   ```

   The frontend application runs on `http://localhost:3000`.

---

## Project Structure

### Frontend Application (`apps/frontend/`)

- **Framework**: Next.js (React and TypeScript)
- **Main Components**:
  - `Chat.tsx`: Main chat interface.
  - `FewShotForm.tsx`: Form for adding few-shot examples.
  - `FileUploadForm.tsx`: Component for uploading files for analysis.
  - `ConversationList.tsx`: Displays conversation history.
  - `SearchForm.tsx`: Search functionality.
- **Utilities**:
  - `fetchWithAuth.ts`: Handles authenticated API requests.
  - `config.ts`: Configuration constants.

### Backend Application (`apps/backend/`)

- **Framework**: Next.js API Routes (TypeScript)
- **Key API Routes**:
  - `/api/start_conversation`: Initiates a new conversation.
  - `/api/send_message`: Handles message sending and AI response retrieval.
  - `/api/reset_conversation`: Resets the current conversation.
  - `/api/list_conversations`: Lists user's conversations.
  - `/api/load_conversation/[conversation_id]`: Loads a specific conversation.
  - `/api/add_few_shot_example`: Adds few-shot examples.
  - `/api/upload_file`: Handles file uploads.
  - `/api/search_conversations`: Searches through conversations.
- **Utilities**:
  - `auth.ts`: JWT-based authentication.
  - `mongodb.ts`: MongoDB connection management.
  - `azure.ts`: Azure OpenAI API integration.
  - `helpers.ts`: Helper functions.
  - `pusher.ts`: Pusher configuration.

---

## Usage

1. **Start a New Conversation**: Click the "New Conversation" button to begin chatting with the AI assistant.

2. **Send Messages**: Type your message in the input field and press Enter or click the send button.

3. **Add Few-Shot Examples**: Use the Few-Shot Form to add examples that influence the assistant's responses.

4. **Upload Files**: Upload text files for the assistant to analyze and discuss.

5. **View Conversation History**: Access previous conversations from the sidebar and reload them.

6. **Search Conversations**: Use the search form to find specific conversations based on keywords.

---

## External Services Integration

### Azure OpenAI Service

- **Usage**: Provides AI-generated responses to user messages and analyzes uploaded files.
- **Setup**:
  - Obtain your API endpoint and key from the Azure portal.
  - Set `AZURE_API_URL` and `API_KEY` in your backend `.env.local`.

### Pusher

- **Usage**: Enables real-time communication between the frontend and backend.
- **Setup**:
  - Create a Pusher app and obtain your credentials.
  - Set `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, and `PUSHER_CLUSTER` in your backend `.env.local`.
  - Set `NEXT_PUBLIC_PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_CLUSTER` in your frontend `.env.local`.

### MongoDB Atlas

- **Usage**: Stores conversations, messages, and user data.
- **Setup**:
  - Create a MongoDB Atlas cluster.
  - Set `MONGODB_URI` in your backend `.env.local` with your connection string.

---

## Deployment

### Deploying to Vercel

1. **Create Vercel Projects**:

   - **Frontend**:
     - Set the **Root Directory** to `apps/frontend`.
   - **Backend**:
     - Set the **Root Directory** to `apps/backend`.

2. **Configure Build Settings**:

   - **Build Command**: `npm run build`
   - **Output Directory**: Defaults to `.next` (no changes needed).

3. **Set Environment Variables**:

   - Add all necessary environment variables in each project's settings on Vercel.

4. **Deploy**:

   - Push your code to the main branch; Vercel will automatically build and deploy.

### Environment Variables in Production

Ensure that all environment variables used in development are also set in your production environment on Vercel, with appropriate values.

---

## Advanced Development

### Implementing User Authentication

- **Objective**: Add user registration and login for personalized experiences.
- **Steps**:
  - **Frontend**: Create `/login` and `/register` pages.
  - **Backend**: Implement `/api/auth/register` and `/api/auth/login` routes.
  - **Security**: Use `bcrypt` for password hashing and JWT for tokens.

### Enhancing Real-Time Features

- **Ideas**:
  - **Typing Indicators**: Show when the assistant is typing.
  - **Presence Indicators**: Display online status.
- **Implementation**:
  - Use Pusher channels and events.

### AI Model Improvements

- **Context Preservation**: Maintain conversation context over longer periods.
- **Custom Models**: Fine-tune AI models with domain-specific data.
- **Response Quality**: Adjust model parameters for better responses.

### Adding New Features

- **Group Chats**: Enable multiple users in a conversation.
- **Media Support**: Allow sending images or files within the chat.
- **Conversation Export**: Let users export conversations.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**: Click the "Fork" button at the top right of the repository page.

2. **Clone Your Fork**:

   ```bash
   git clone https://github.com/yourusername/chatapp-vercel-d.git
   ```

3. **Create a Feature Branch**:

   ```bash
   git checkout -b feature/YourFeatureName
   ```

4. **Make Changes**: Implement your feature or fix.

5. **Commit Changes**:

   ```bash
   git commit -m "Description of your changes"
   ```

6. **Push to Your Fork**:

   ```bash
   git push origin feature/YourFeatureName
   ```

7. **Create a Pull Request**: Go to the original repository and click "Compare & pull request."

---

## License

This project is licensed under the [MIT License](LICENSE).

---

**Note**: Remember to keep your API keys and secrets secure. Do not share them publicly or commit them to version control. Use environment variables to manage sensitive information.

---

If you have any questions or need assistance, please feel free to open an issue or reach out.

Happy coding!