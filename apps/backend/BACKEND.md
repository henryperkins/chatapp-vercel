# Backend Documentation

## Overview

The backend of ChatApp Vercel-D is built using Next.js 13.5.2 with TypeScript, leveraging API Routes for serverless function deployment. It handles API requests, database operations, and integrates with external services like MongoDB, Pusher, and Azure OpenAI Service.

## Project Structure

```
apps/backend/
├── pages/
│   └── api/
│       ├── add_few_shot_example.ts
│       ├── get_config.ts
│       ├── list_conversations.ts
│       ├── load_conversation/[conversation_id].ts
│       ├── reset_conversation.ts
│       ├── search_conversations.ts
│       ├── send_message.ts
│       ├── start_conversation.ts
│       └── upload_file.ts
├── types/
│   └── index.d.ts
├── utility/
│   ├── auth.ts
│   ├── azure.ts
│   ├── helpers.ts
│   ├── middleware/
│   │   └── cors.ts
│   ├── mongodb.ts
│   └── pusher.ts
├── package.json
└── tsconfig.json
```

## API Endpoints

### /api/add\_few\_shot\_example (Optional)

-   **Purpose**: Adds few-shot examples to influence AI responses.
-   **Method**: POST
-   **Input**:

```json
{
  "user_prompt": "Example user prompt",
  "assistant_response": "Example assistant response"
}
```

-   **Output**: Confirmation of addition.

**Code Snippet:**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';
import { errorHandler } from '@/middleware/errorHandler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Authenticate the user (if applicable)
    // const user = await authenticate(req);

    const { user_prompt, assistant_response } = req.body;

    // Validate input
    if (!user_prompt || !assistant_response) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    // Insert the new few-shot example into the database
    await db.collection('fewShotExamples').insertOne({
      // user_id: user.id, // If using authentication
      user_prompt,
      assistant_response,
      created_at: new Date(),
    });

    res.status(201).json({ message: 'Few-shot example added successfully' });
  } catch (error) {
    errorHandler(error, res);
  }
}
```

### /api/get\_config

-   **Purpose**: Retrieves configuration settings.
-   **Method**: GET
-   **Output**:

```json
{
  "config": {
    "max_tokens": "128000",
    "reply_tokens": "800",
    "chunk_size_tokens": "1000"
  }
}
```

**Code Snippet:**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Optionally authenticate the user
  // const user = await authenticate(req);

  // Retrieve configuration settings (you can fetch these from a database or environment variables)
  const config = {
    max_tokens: '128000',
    reply_tokens: '800',
    chunk_size_tokens: '1000',
  };

  res.status(200).json({ config });
}
```

### /api/list\_conversations

-   **Purpose**: Lists user conversations.
-   **Method**: GET
-   **Output**:

```json
{
  "conversations": [
    {
      "conversation_id": "uuid",
      "user_id": "user_id",
      "messages": [],
      "created_at": "date",
      "updated_at": "date",
      "title": "optional title"
    },
    // ... more conversations
  ]
}
```

**Code Snippet:**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';
import { Conversation } from '@/types/models';
import { errorHandler } from '@/middleware/errorHandler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Authenticate the user (if applicable)
    // const user = await authenticate(req);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    // Fetch conversations from the database (adjust query based on your authentication implementation)
    const conversations: Conversation[] = await db
      .collection('conversations')
      // .find({ user_id: user.id }) // If using authentication
      .toArray();

    res.status(200).json({ conversations });
  } catch (error) {
    errorHandler(error, res);
  }
}
```

### /api/load\_conversation/\[conversation\_id]

-   **Purpose**: Loads a specific conversation.
-   **Method**: GET
-   **Input**: Conversation ID (in URL).
-   **Output**:

```json
{
  "conversation": [
    {
      "role": "user",
      "content": "message content"
    },
    // ... more messages
  ]
}
```

**Code Snippet:**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Authenticate the user (if applicable)
    // const user = await authenticate(req);

    const conversationId = req.query.conversation_id as string;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    // Fetch the conversation from the database
    const conversation = await db
      .collection('conversations')
      .findOne({ conversation_id: conversationId });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.status(200).json({ conversation: conversation.messages });
  } catch (error) {
    errorHandler(error, res);
  }
}
```

### /api/reset\_conversation

-   **Purpose**: Resets the current conversation.
-   **Method**: POST
-   **Input**:

```json
{
  "conversation_id": "uuid"
}
```

-   **Output**: Confirmation of reset.

**Code Snippet:**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';
import { errorHandler } from '@/middleware/errorHandler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Authenticate the user (if applicable)
    // const user = await authenticate(req);

    const { conversation_id } = req.body;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    // Update the conversation in the database to clear its messages
    const result = await db
      .collection('conversations')
      .updateOne(
        { conversation_id },
        { $set: { messages: [], updated_at: new Date() } }
      );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.status(200).json({ message: 'Conversation reset successfully' });
  } catch (error) {
    errorHandler(error, res);
  }
}
```

### /api/search\_conversations

-   **Purpose**: Searches through conversations.
-   **Method**: POST
-   **Input**:

```json
{
  "query": "search term"
}
```

-   **Output**:

```json
{
  "results": [
    {
      "conversation_id": "uuid",
      "title": "optional title",
      "updated_at": "date"
    },
    // ... more matching conversations
  ]
}
```

**Code Snippet:**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Authenticate the user (if applicable)
    // const user = await authenticate(req);

    const { query } = req.body;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    // Perform a text search on the 'messages.content' field
    const results = await db
      .collection('conversations')
      .aggregate([
        {
          $match: {
            $text: {
              $search: query,
            },
          },
        },
        {
          $project: {
            conversation_id: 1,
            title: 1,
            updated_at: 1,
            score: { $meta: 'textScore' }, // Include text search score
          },
        },
        { $sort: { score: { $meta: 'textScore' } } }, // Sort by relevance
      ])
      .toArray();

    res.status(200).json({ results });
  } catch (error) {
    errorHandler(error, res);
  }
}
```

### /api/send\_message

-   **Purpose**: Sends a new message and retrieves AI response.
-   **Method**: POST
-   **Input**:

```json
{
  "conversation_id": "uuid",
  "message": "user's message"
}
```

-   **Output**: AI response (sent via Pusher).

**Code Snippet:**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';
import { getAzureResponse } from '@/utils/azure';
import { PusherInstance } from '@/utils/pusher';
import { errorHandler } from '@/middleware/errorHandler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Authenticate the user (if applicable)
    // const user = await authenticate(req);

    const { conversation_id, message } = req.body;

    // 1. Store the user's message in the database
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    await db.collection('conversations').updateOne(
      { conversation_id },
      {
        $push: {
          messages: {
            role: 'user',
            content: message,
            timestamp: new Date(),
          },
        },
        $set: { updated_at: new Date() },
      }
    );

    // 2. Get the AI response (replace with your actual AI implementation)
    const messagesHistory = [
      { role: 'system', content: 'You are a helpful assistant.' }, // System message
      // ... potentially load previous messages from the database based on conversation_id
      { role: 'user', content: message }, // Current user message
    ];
    const aiResponse = await getAzureResponse(
      messagesHistory,
      // ... other parameters like temperature, max_tokens, etc.
    );

    // 3. Store the AI response in the database
    await db.collection('conversations').updateOne(
      { conversation_id },
      {
        $push: {
          messages: {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date(),
          },
        },
        $set: { updated_at: new Date() },
      }
    );

    // 4. Send a real-time update with Pusher
    await PusherInstance.trigger(
      conversation_id,
      'new-message',
      aiResponse
    );

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    errorHandler(error, res);
  }
}
```

### /api/start\_conversation

-   **Purpose**: Initiates a new conversation.
-   **Method**: POST
-   **Output**:

```json
{
  "conversation_id": "uuid"
}
```

**Code Snippet:**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';
import { v4 as uuidv4 } from 'uuid';
import { errorHandler } from '@/middleware/errorHandler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Authenticate the user (if applicable)
    // const user = await authenticate(req);

    const conversation_id = uuidv4();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    // Create a new conversation in the database
    await db.collection('conversations').insertOne({
      conversation_id,
      // user_id: user.id, // If using authentication
      messages: [],
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json({ conversation_id });
  } catch (error) {
    errorHandler(error, res);
  }
}
```

### /api/upload\_file

-   **Purpose**: Handles file uploads for analysis (implementation details not provided).
-   **Method
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { authenticate } from '@/utils/auth';
import { analyzeFileContent } from '@/utils/azure';
import clientPromise from '@/utils/mongodb';
import { errorHandler } from '@/middleware/errorHandler';

export const config = {
  api: {
    bodyParser: false, // Important: Disable the default body parser
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Authenticate the user (if applicable)
    // const user = await authenticate(req);

    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ message: 'Error parsing the file' });
      }

      const file = files.file as formidable.File;

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Read the file content
      const fileContent = fs.readFileSync(file.filepath, 'utf-8');

      // Perform analysis (replace with your actual analysis logic)
      const analysisResults = await analyzeFileContent(fileContent);

      // Store analysis results in the database (optional)
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME);
      // ... your database logic ...

      res.status(200).json({ analysisResults });
    });
  } catch (error) {
    errorHandler(error, res);
  }
}
```

## Utilities

### auth.ts

-   Handles JWT-based authentication (if implemented).
-   Includes functions for token generation and verification.

### azure.ts

-   Integrates with Azure OpenAI Service.
-   Handles API calls for AI-generated responses.

**Code Snippet: Getting an AI Response from Azure**

```typescript
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.AZURE_API_KEY,
  basePath: process.env.AZURE_API_URL,
});

const openai = new OpenAIApi(configuration);

export const getAzureResponse = async (
  messages: any[],
  max_tokens: number = 1000,
  temperature: number = 0.7
) => {
  try {
    const response = await openai.createChatCompletion({
      model: process.env.AZURE_DEPLOYMENT_NAME || '',
      messages,
      max_tokens,
      temperature,
    });

    return response.data.choices[0].message?.content || '';
  } catch (error) {
    console.error('Error getting response from Azure:', error);
    throw error; // Re-throw the error to be handled at a higher level
  }
};
```

**Explanation:**

1.  **Configuration:** The code sets up the OpenAI API client using the API key, base URL, and deployment name from your environment variables.
2.  **API Call:** The `getAzureResponse` function makes a request to the Azure OpenAI API to generate a chat completion. It takes the conversation history (`messages`), `max_tokens`, and `temperature` as parameters.
3.  **Response Handling:** The function extracts the AI's response from the API response and returns it.
4.  **Error Handling:** The code includes error handling to catch any issues during the API call and logs the error for debugging.

### helpers.ts

-   Contains utility functions used across the backend.
-   Includes data processing and formatting functions.

### middleware/cors.ts

-   Implements CORS (Cross-Origin Resource Sharing) middleware.
-   Configures allowed origins and methods.

### mongodb.ts

-   Manages MongoDB connection.
-   Provides functions for database operations.

**Code Snippet: Connecting to MongoDB**

```typescript
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || ''; // Get MongoDB URI from environment variables
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
```

**Explanation:**

1.  **Environment Variable:** The code retrieves the MongoDB connection URI from the `MONGODB_URI` environment variable.
2.  **Development Mode Optimization:** In development mode, it uses a global variable to store the MongoDB client promise. This optimization ensures that the connection is preserved across hot module reloads, improving development speed.
3.  **Production Mode:** In production mode, it creates a new MongoClient instance for each request. This approach is more suitable for production environments where hot module reloading is not a concern.
4.  **Shared Client:** The code exports the `clientPromise`, which represents a promise that resolves to the connected MongoDB client. This allows the client to be shared across different parts of the backend application.

### pusher.ts

-   Configures Pusher for real-time updates.
-   Includes functions for sending events to the frontend.

**Code Snippet: Initializing Pusher**

```typescript
import Pusher from 'pusher';

export const PusherInstance = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || '',
  useTLS: true,
});
```

**Explanation:**

-   **Pusher Configuration:** This code snippet initializes a Pusher instance using your Pusher app credentials (app ID, key, secret, and cluster). These credentials are typically stored in environment variables for security.
-   **TLS Connection:** The `useTLS: true` option ensures that the connection to Pusher is secure, using Transport Layer Security (TLS) for encryption.

## Types

### index.d.ts

-   Defines TypeScript interfaces and types used throughout the backend.
-   Includes definitions for request/response objects, database models, etc.

## Database Schema

The backend uses MongoDB for data storage. Key collections include:

1.  **Conversations**
    -   `_id`: ObjectId
    -   `user_id`: String
    -   `title`: String (optional)
    -   `created_at`: Date
    -   `updated_at`: Date
    -   `messages`: Array of Message objects

2.  **Messages**
    -   `_id`: ObjectId
    -   `role`: String ("user" or "assistant")
    -   `content`: String

3.  **FewShotExamples** (Optional)
    -   `_id`: ObjectId
    -   `user_id`: String
    -   `user_prompt`: String
    -   `assistant_response`: String
    -   `created_at`: Date

## External Services Integration

### Azure OpenAI Service

-   Used for generating AI responses.
-   Configured in `azure.ts`.
-   API calls are made in `send_message.ts`.

### Pusher

-   Used for real-time updates to the frontend.
-   Configured in `pusher.ts`.
-   Events are triggered in various API endpoints (e.g., `send_message.ts`).

## Error Handling

-   Each API route includes try-catch blocks for error handling.
-   Errors are logged and appropriate HTTP status codes are returned.
-   Custom error messages are sent to the client for better debugging.

## Performance Considerations

-   Database queries are optimized with proper indexing.
-   Caching mechanisms can be implemented where appropriate.
-   Large response payloads can be paginated.

## Testing

-   Jest is set up for unit and integration tests.
-   Each utility function and API route should have associated test files.
-   Mock data is used to simulate database and external service responses.

## Deployment

The backend is configured for deployment on Vercel:

-   Each API route is deployed as a serverless function.
-   Environment variables are managed through Vercel's dashboard.

## Development Workflow

1.  Implement new features or modify existing ones in the `pages/api/` directory.
2.  Update or add utility functions in the `utility/` directory as needed.
3.  Run tests locally: `npm run test`.
4.  Use `npm run dev` to test the API locally.
5.  Commit changes and push to the repository.
6.  Vercel will automatically deploy the changes.
