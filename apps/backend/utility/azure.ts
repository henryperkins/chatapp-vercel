import axios from 'axios';

export async function getAzureResponse(messages: any[]): Promise<string> {
  const apiUrl = process.env.AZURE_API_URL || '';
  const apiKey = process.env.API_KEY || '';

  if (!apiUrl || !apiKey) {
    throw new Error('Azure API URL and API Key must be set.');
  }

  try {
    const response = await axios.post(
      apiUrl,
      {
        messages,
        max_tokens: parseInt(process.env.REPLY_TOKENS || '800', 10),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('Error calling Azure OpenAI API:', error.response?.data || error.message);
    throw new Error('Failed to get response from Azure OpenAI API.');
  }
}

export async function analyzeFileContent(content: string): Promise<string> {
  // Implement the logic to analyze file content using Azure OpenAI API
  // For example, you can use the summarization or analysis capabilities
  // This is a placeholder function
  return 'Analysis result of the file content.';
}
