// File: apps/backend/utils/azure.ts

import axios from 'axios';

export async function analyzeFileContent(content: string): Promise<string> {
  const apiUrl = process.env.AZURE_API_URL || '';
  const apiKey = process.env.API_KEY || '';
  const deploymentName = process.env.DEPLOYMENT_NAME || '';

  if (!apiUrl || !apiKey || !deploymentName) {
    throw new Error('Azure API URL, API Key, and Deployment Name must be set.');
  }

  try {
    const prompt = `Please analyze the following content and provide a detailed summary:\n\n${content}`;
    const response = await axios.post(
      `${apiUrl}/openai/deployments/${deploymentName}/completions?api-version=2023-05-15`,
      {
        prompt,
        max_tokens: parseInt(process.env.REPLY_TOKENS || '800', 10),
        temperature: 0.7, // Optional: Adjust as needed
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
      }
    );

    return response.data.choices[0].text.trim();
  } catch (error: any) {
    console.error('Error analyzing file content:', error.response?.data || error.message);
    throw new Error('Failed to analyze file content with Azure OpenAI API.');
  }
}
