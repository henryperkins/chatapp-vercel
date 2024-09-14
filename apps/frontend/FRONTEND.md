# Frontend Documentation

## Overview

The frontend of ChatApp Vercel-D is built using Next.js 13.5.2 with React 18.2.0 and TypeScript. It provides a responsive and interactive chat interface with features like real-time updates, file uploads, and conversation management.

## Project Structure

```
apps/frontend/
├── src/
│   ├── components/
│   │   ├── Chat.tsx
│   │   ├── ConversationList.tsx
│   │   ├── FewShotForm.tsx
│   │   ├── FileUploadForm.tsx
│   │   └── SearchForm.tsx
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   └── index.tsx
│   └── utilities/
│       ├── config.js
│       └── fetchWithAuth.ts
├── package.json
└── tsconfig.json
```

## Key Components

### Chat.tsx

The main chat interface component. It handles:
- Displaying messages
- Sending new messages
- Real-time updates using Pusher
- Interaction with the AI assistant

### ConversationList.tsx

Displays a list of user conversations. Features include:
- Loading past conversations
- Selecting a conversation to view
- Deleting conversations

### FewShotForm.tsx

A form component for adding few-shot examples. It allows users to:
- Input example queries and responses
- Submit new few-shot examples to influence the AI's behavior

### FileUploadForm.tsx

Handles file uploads for analysis. It includes:
- File selection interface
- File type validation
- Upload progress indication
- Displaying analysis results

### SearchForm.tsx

Provides conversation search functionality:
- Input field for search queries
- Displaying search results
- Navigating to specific conversations from search results

## Utilities

### config.js

Contains configuration settings for the frontend, including:
- API base URL
- Pusher configuration
- Other app-wide constants

### fetchWithAuth.ts

A utility for making authenticated API requests. It:
- Adds authentication headers to requests
- Handles token refresh if needed
- Provides a consistent interface for API calls across the app

## Pages

### _app.tsx

The main App component that wraps all pages. It includes:
- Global styles
- Context providers (if any)
- Layout components

### _document.tsx

Customizes the HTML document structure. Used for:
- Adding custom fonts
- Inserting meta tags
- Including external scripts or stylesheets

### index.tsx

The main page of the application. It typically includes:
- The Chat component
- ConversationList
- Other main UI elements

## Styling

- CSS modules are used for component-specific styles
- Global styles are defined in `src/global.css`
- Responsive design is implemented for various screen sizes

## State Management

- React's built-in useState and useContext hooks are used for local and global state management
- Pusher is used for real-time updates from the server

## API Integration

- The frontend communicates with the backend API using fetch or axios
- API calls are typically made from within components or custom hooks
- Error handling and loading states are managed for each API call

## Performance Optimization

- Next.js's built-in code splitting is utilized
- Images are optimized using Next.js Image component
- Memoization techniques (useMemo, useCallback) are used where appropriate

## Testing

- Jest is set up for unit and integration tests
- React Testing Library is used for component testing
- Key components and utilities should have associated test files

## Deployment

The frontend is configured for deployment on Vercel:
- Automatic deployments are triggered on pushes to the main branch
- Environment variables are managed through Vercel's dashboard

## Development Workflow

1. Make changes to components or pages
2. Test changes locally using `npm run dev`
3. Run linter and fix any issues: `npm run lint`
4. Run tests: `npm run test`
5. Commit changes and push to the repository
6. Vercel will automatically deploy the changes

## Future Improvements

- Implement more comprehensive error handling
- Add more unit and integration tests
- Optimize performance for larger conversations
- Enhance accessibility features
- Implement progressive web app (PWA) features