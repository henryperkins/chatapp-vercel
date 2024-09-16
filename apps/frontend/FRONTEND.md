## FRONTEND.md

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

**Code Snippet: Sending a Message**

```typescript
  // ... other component logic ...

  const sendMessage = async () => {
    // Don't send empty messages
    if (newMessage.trim() === '') return; 

    // Create a new message object 
    const messageToSend: Message = {
      role: 'user',
      content: newMessage,
    };

    // Optimistically update the UI with the user's message
    setMessages((prevMessages) => [...prevMessages, messageToSend]);
    setNewMessage(''); // Clear the input field

    try {
      // Send the message to the backend API
      const response = await fetchWithAuth(`/api/send_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: currentConversationId,
          message: newMessage,
        }),
      });

      // Check for successful response
      if (!response.ok) {
        throw new Error(`Error sending message: ${response.status}`);
      }
      // ... (Handle the response, if needed) ...

    } catch (error) {
      console.error('Error sending message:', error);
      notyf.error('Failed to send message. Please try again later.');
    }
  };

  // ... (Rest of the Chat component logic, including Pusher setup) ...
```

**Explanation:**

1.  **Input Validation:** The `sendMessage` function first checks if the message is empty.
2.  **Optimistic UI Update:** The user's message is immediately added to the `messages` state to provide instant feedback, making the chat feel more responsive.
3.  **API Call:** A `POST` request is made to the `/api/send_message` endpoint with the message content and the current conversation ID.
4.  **Error Handling:** The code handles potential errors during the API call and displays an error message to the user using the `notyf` library.

**Code Snippet: Receiving Real-time Updates with Pusher**

```typescript
  // ... (Other component logic) ...

  useEffect(() => {
    // Initialize Pusher (replace with your actual Pusher key and cluster)
    const pusher = new Pusher('YOUR_PUSHER_APP_KEY', {
      cluster: 'YOUR_PUSHER_CLUSTER',
    });

    // Subscribe to the current conversation's channel
    const channel = pusher.subscribe(currentConversationId);

    // Listen for 'new-message' events on the channel
    channel.bind('new-message', (data: { message: Message }) => {
      // Update the messages state with the new message from the server
      setMessages((prevMessages) => [...prevMessages, data.message]);
    });

    // Clean up the Pusher subscription when the component unmounts
    return () => {
      pusher.unsubscribe(currentConversationId);
    };
  }, [currentConversationId]); 

  // ... (Rest of the Chat component logic) ...
```

**Explanation:**

1.  **Pusher Initialization:** The `useEffect` hook initializes a Pusher instance with your app's key and cluster.
2.  **Channel Subscription:** The component subscribes to a Pusher channel that corresponds to the current conversation ID. This ensures that the chat interface receives real-time updates specific to the active conversation.
3.  **Event Binding:** The component listens for `new-message` events on the subscribed channel. These events are triggered by the backend whenever a new message is added to the conversation.
4.  **UI Update:** When a `new-message` event is received, the chat interface updates the `messages` state with the new message data, seamlessly appending it to the conversation history.
5.  **Cleanup:** The `useEffect` hook also includes a cleanup function that unsubscribes from the Pusher channel when the component unmounts. This prevents memory leaks and ensures that the component stops receiving updates when it's no longer in use.

### ConversationList.tsx

Displays a list of user conversations. Features include:

-   Loading past conversations
-   Selecting a conversation to view

**Code Snippet: Fetching and Displaying Conversations**

```typescript
import React, { useState, useEffect, useContext } from 'react';
import { ConversationContext } from '../contexts/ConversationContext';
import fetchWithAuth from '../utils/fetchWithAuth';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { Conversation, ApiResponse } from '../utils/types';
import './ConversationList.css';

const notyf = new Notyf();

const ConversationList: React.FC = () => {
  const { setCurrentConversationId } = useContext(ConversationContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response: ApiResponse<Conversation[]> = await fetchWithAuth(
          '/api/list_conversations'
        );

        if (!response.ok) {
          throw new Error(`Error fetching conversations: ${response.status}`);
        }

        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        notyf.error(
          'Failed to load conversations. Please try again later.'
        );
      }
    };

    fetchConversations();
  }, []);

  const handleConversationSelect = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  return (
    <div className="conversation-list">
      <h3>Conversations</h3>
      <ul>
        {conversations.map((conversation) => (
          <li
            key={conversation.conversation_id}
            onClick={() =>
              handleConversationSelect(conversation.conversation_id)
            }
          >
            {conversation.title || 'New Conversation'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;

```

**Explanation:**

1.  **Fetching Conversations:** The `useEffect` hook fetches the list of conversations from the `/api/list_conversations` endpoint when the component mounts.
2.  **Storing Conversations:** The fetched conversations are stored in the `conversations` state variable using `setConversations`.
3.  **Displaying Conversations:** The component renders a list of conversations, and each conversation is displayed as a clickable list item (`<li>`).
4.  **Handling Conversation Selection:** When a conversation is clicked, the `handleConversationSelect` function is called, which updates the `currentConversationId` in the `ConversationContext`. This triggers the `Chat` component to load and display the selected conversation.

### FewShotForm.tsx (Optional)

A form component for adding few-shot examples. It allows users to:

-   Input example queries and responses
-   Submit new few-shot examples to influence the AI's behavior

**Code Snippet: Submitting a Few-Shot Example**

```typescript
import React, { useState } from 'react';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import fetchWithAuth from '../utils/fetchWithAuth';

const notyf = new Notyf();

const FewShotForm: React.FC = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetchWithAuth('/api/add_few_shot_example', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_prompt: userPrompt,
          assistant_response: assistantResponse,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error adding few-shot example: ${response.status}`);
      }

      // Clear the form fields after successful submission
      setUserPrompt('');
      setAssistantResponse('');
      notyf.success('Few-shot example added successfully!');
    } catch (error) {
      console.error('Error adding few-shot example:', error);
      notyf.error('Failed to add few-shot example. Please try again later.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Few-Shot Example</h3>
      <div>
        <label htmlFor="user-prompt">User Prompt:</label>
        <textarea
          id="user-prompt"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="assistant-response">Assistant Response:</label>
        <textarea
          id="assistant-response"
          value={assistantResponse}
          onChange={(e) => setAssistantResponse(e.target.value)}
        />
      </div>
      <button type="submit">Add Example</button>
    </form>
  );
};

export default FewShotForm;

```

**Explanation:**

1.  **Managing Input Values:** The component uses `useState` to keep track of the user's input in the "User Prompt" and "Assistant Response" fields.
2.  **Handling Form Submission:** When the form is submitted, the `handleSubmit` function is called.
3.  **Sending the Example to the Backend:** The `handleSubmit` function sends a `POST` request to the `/api/add_few_shot_example` endpoint, including the `user_prompt` and `assistant_response` in the request body.
4.  **Handling the Response:** After the request is sent, the component handles the response from the backend. If the example is added successfully, it clears the form fields and displays a success message. If there's an error, it displays an error message to the user.

### FileUploadForm.tsx

Handles file uploads for analysis. It includes:

-   File selection interface
-   File type validation
-   Upload progress indication
-   Displaying analysis results

**Code Snippet: Handling File Upload**

```typescript
import React, { useState } from 'react';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import fetchWithAuth from '../utils/fetchWithAuth';
import { API_BASE_URL } from '../utils/config';
import './FileUploadForm.css';

const notyf = new Notyf();

const FileUploadForm: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Basic file type validation (you can add more robust validation)
      if (!file.type.startsWith('text/')) {
        notyf.error('Only text files are allowed.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetchWithAuth('/api/upload_file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error uploading file: ${response.status}`);
      }

      // Handle the response (e.g., display analysis results)
      const data = await response.json();
      console.log('File analysis results:', data);
      notyf.success('File uploaded and analyzed successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      notyf.error('Failed to upload file. Please try again later.');
    }
  };

  return (
    <div>
      <h3>File Upload</h3>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile}>
        Upload
      </button>
    </div>
  );
};

export default FileUploadForm;

```

**Explanation:**

1.  **File Selection:** The component provides a file input element (`<input type="file" />`) for users to select a file from their device.
2.  **File Validation:** When a file is selected, the `handleFileChange` function performs basic validation to ensure that the selected file is a text file. You can customize this validation logic to enforce specific file type restrictions.
3.  **File Upload:** The `handleUpload` function is triggered when the "Upload" button is clicked. It creates a `FormData` object, appends the selected file to it, and sends a `POST` request to the `/api/upload_file` endpoint.
4.  **Error Handling and Response:** The code includes error handling to catch any issues during the upload process. If the upload is successful, it typically displays a success message to the user. If there's an error, it shows an appropriate error message.

### SearchForm.tsx

Provides conversation search functionality:

-   Input field for search queries
-   Displaying search results
-   Navigating to specific conversations from search results

**Code Snippet: Performing a Search**

```typescript
import React, { useState } from 'react';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import fetchWithAuth from '../utils/fetchWithAuth';

// Import Font Awesome components and icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

interface SearchResult {
  conversation_id: string;
  title?: string;
  updated_at: string;
}

const notyf = new Notyf();

const SearchForm: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    try {
      const response = await fetchWithAuth('/api/search_conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error(`Error searching conversations: ${response.status}`);
      }

      const data: { results: SearchResult[] } = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Error searching conversations:', error);
      notyf.error('Failed to search conversations. Please try again later.');
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search conversations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>
        <FontAwesomeIcon icon={faSearch} />
      </button>

      {/* Display search results */}
      <ul>
        {searchResults.map((result) => (
          <li key={result.conversation_id}>
            {/* Link to the conversation */}
            <a href={`/conversation/${result.conversation_id}`}>
              {result.title || 'Untitled Conversation'}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchForm;

```

**Explanation:**

1.  **Search Input:** The component provides a text input field (`<input type="text" />`) where users can enter their search queries. The `searchQuery` state variable is used to store the current search term.
2.  **Search Button:** When the search button (with the magnifying glass icon) is clicked, the `handleSearch` function is executed.
3.  **API Request:** The `handleSearch` function sends a `POST` request to the `/api/search_conversations` endpoint, passing the `searchQuery` as part of the request body.
4.  **Displaying Results:** The component receives the search results from the backend and stores them in the `searchResults` state variable. It then dynamically renders a list of search results, usually as links that users can click to navigate to the relevant conversations.

## Utilities

### config.js

Contains configuration settings for the frontend, including:

-   API base URL
-   Pusher configuration
-   Other app-wide constants

**Code Snippet:**

```javascript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
export const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || '';
export const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '';
```

### fetchWithAuth.ts

A utility for making authenticated API requests. It:

-   Adds authentication headers to requests
-   Provides a consistent interface for API calls across the app

**Code Snippet:**

```typescript
import { API_BASE_URL } from './config';
import { getToken } from './auth';

export const fetchWithAuth = async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken(); // Replace with your actual token retrieval logic

  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : '',
  };

  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
};

export default fetchWithAuth;
```

## Pages

### \_app.tsx

The main App component that wraps all pages. It includes:

-   Global styles
-   Context providers
-   Layout components

### \_document.tsx

Customizes the HTML document structure. Used for:

-   Adding custom fonts
-   Inserting meta tags
-   Including external scripts or stylesheets

### index.tsx

The main page of the application. It typically includes:

-   The Chat component
-   ConversationList
-   Other main UI elements

## Styling

-   CSS modules are used for component-specific styles
-   Global styles are defined in `src/styles/globals.css`
-   Responsive design is implemented for various screen sizes

## State Management

-   React's built-in `useState` and `useContext` hooks are used for local and global state management
-   Pusher is used for real-time updates from the server

## API Integration

-   The frontend communicates with the backend API using `fetch`
-   API calls are typically made from within components or custom hooks
-   Error handling and loading states are managed for each API call

## Performance Optimization

-   Next.js's built-in code splitting is utilized
-   Images are optimized using Next.js Image component
-   Memoization techniques (`useMemo`, `useCallback`) are used where appropriate

## Testing

-   Jest is set up for unit and integration tests
-   React Testing Library is used for component testing
-   Key components and utilities should have associated test files

## Deployment

The frontend is configured for deployment on Vercel:

-   Automatic deployments are triggered on pushes to the main branch
-   Environment variables are managed through Vercel's dashboard

## Development Workflow

1.  Make changes to components or pages
2.  Test changes locally using `npm run dev`
3.  Run linter and fix any issues: `npm run lint`
4.  Run tests: `npm run test`
5.  Commit changes and push to the repository
6.  Vercel will automatically deploy the changes
