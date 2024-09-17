// apps/backend/utils/azure.ts
import { Configuration, OpenAIApi } from 'openai';

// Configure the OpenAI API client
const configuration = new Configuration({
  apiKey: process.env.AZURE_API_KEY,
  basePath: process.env.AZURE_API_URL,
});
const openai = new OpenAIApi(configuration);

// Function to get a chat completion from Azure OpenAI
export const getAzureResponse = async (
  messages: any[], // Array of message objects (role: 'user' or 'assistant', content: 'message text')
  max_tokens: number = 1000, // Maximum number of tokens to generate
  temperature: number = 0.7, // Controls the randomness of the response (0.0 - 1.0)
  top_p: number = 1 // Controls the diversity of the response (0.0 - 1.0)
): Promise<string> => {
  try {
    const response = await openai.createChatCompletion({
      model: process.env.AZURE_DEPLOYMENT_NAME || '', // Use the deployment name from environment variables
      messages,
      max_tokens,
      temperature,
      top_p, // Include top_p in the request
      // Add other parameters as needed (e.g., presence_penalty, frequency_penalty)
    });

    // Extract and return the assistant's response
    return response.data.choices[0].message?.content || ''; 
  } catch (error) {
    console.error('Error getting response from Azure:', error);
    throw error; // Re-throw the error to be handled at a higher level
  }
};

// Function to count tokens (using a simple approximation for now)
export const countTokens = (text: string): number => {
  // You can use a more accurate token counting library if needed
  // For now, we'll approximate 1 token per word
  return text.split(/\s+/).length; 
};

// Function to manage the context window (basic implementation)
export const manageContextWindow = (messages: any[], maxTokens: number): any[] => {
  let totalTokens = 0;
  const contextWindow: any[] = [];

  // Iterate through messages in reverse order (newest to oldest)
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = countTokens(message.content);

    if (totalTokens + messageTokens <= maxTokens) {
      contextWindow.unshift(message); // Add message to the beginning of the context window
      totalTokens += messageTokens;
    } else {
      break; // Stop adding messages if the context window is full
    }
  }

  return contextWindow;
};
