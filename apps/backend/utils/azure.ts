import { Configuration, OpenAIApi } from 'openai';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import fs from 'fs';
import path from 'path';

// Configure the OpenAI API client
const configuration = new Configuration({
  apiKey: process.env.AZURE_API_KEY,
  basePath: process.env.AZURE_API_URL,
});
const openai = new OpenAIApi(configuration);

// Configure the Azure OpenAI client
const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const apiKey = process.env.AZURE_OPENAI_API_KEY!;
const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Function to get a chat completion from Azure OpenAI
export const getAzureResponse = async (
  messages: ChatMessage[],
  max_tokens: number = 1000,
  temperature: number = 0.7,
  top_p: number = 1
): Promise<string> => {
  try {
    const response = await openai.createChatCompletion({
      model: process.env.AZURE_DEPLOYMENT_NAME || '',
      messages,
      max_tokens,
      temperature,
      top_p,
    });

    return response.data.choices[0].message?.content || ''; 
  } catch (error) {
    console.error('Error getting response from Azure:', error);
    throw error;
  }
};

// Function to count tokens (using a simple approximation for now)
export const countTokens = (text: string): number => {
  return text.split(/\s+/).length; 
};

// Function to manage the context window (basic implementation)
export const manageContextWindow = (messages: ChatMessage[], maxTokens: number): ChatMessage[] => {
  let totalTokens = 0;
  const contextWindow: ChatMessage[] = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = countTokens(message.content);

    if (totalTokens + messageTokens <= maxTokens) {
      contextWindow.unshift(message);
      totalTokens += messageTokens;
    } else {
      break;
    }
  }

  return contextWindow;
};

// Function to analyze file content
export async function analyzeFileContent(filePath: string): Promise<string> {
  try {
    const absolutePath = path.resolve(filePath);
    const fileContent = fs.readFileSync(absolutePath, 'utf-8');

    const prompt = `Analyze the following content:\n\n${fileContent}`;

    const deploymentName = process.env.AZURE_DEPLOYMENT_NAME || '';
    const result = await client.getCompletions(deploymentName, prompt, {
      maxTokens: 150,
      temperature: 0.7,
    });

    const analysis = result.choices[0].text.trim();
    return analysis;
  } catch (error) {
    console.error('Error in analyzeFileContent:', error);
    throw new Error('Failed to analyze file content');
  }
}
