// File: apps/frontend/src/components/FileUploadForm.tsx

import React, { useState } from 'react';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { AzureKeyCredential, DocumentAnalysisClient } from '@azure/ai-form-recognizer';
import './FileUploadForm.css';

const notyf = new Notyf();

const FileUploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      notyf.error('Please select a file to upload.');
      return;
    }

    setUploading(true);

    try {
      // Analyze the file using Form Recognizer
      const analysisResult = await analyzeFileWithFormRecognizer(file);
      setAnalysis(JSON.stringify(analysisResult, null, 2)); // Format the analysis result
      notyf.success('File uploaded and analyzed successfully.');
      setFile(null);
    } catch (error: any) {
      notyf.error(error.message || 'Failed to analyze file.');
    } finally {
      setUploading(false);
    }
  };

  // Function to analyze the file using Azure Form Recognizer
  const analyzeFileWithFormRecognizer = async (file: File): Promise<any> => {
  const endpoint = process.env.FORM_RECOGNIZER_ENDPOINT || '';
  const apiKey = process.env.FORM_RECOGNIZER_API_KEY || '';

  const credential = new AzureKeyCredential(apiKey);
  const client = new DocumentAnalysisClient(endpoint, credential);

  // Convert the File object to a Blob
  const fileBlob = new Blob([file], { type: file.type });

  try {
    // Determine the appropriate model and analysis logic based on file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      // Parse CSV data using Papa Parse
      const csvText = await fileBlob.text();
      const parsedData = Papa.parse(csvText, { header: true }).data;
      return { csvData: parsedData };
    } else if (['txt', 'md', 'js', 'py'].includes(fileExtension || '')) {
      // Handle text-based files (summarization, keyword extraction, etc.)
      const textContent = await fileBlob.text();
      // ... call Azure APIs for summarization, keyword extraction, etc. ...
      return { textContent, /* ... analysis results ... */ };
    } else {
      // Analyze other document types using Form Recognizer
      const poller = await client.beginAnalyzeDocument('prebuilt-document', fileBlob);
      const result = await poller.pollUntilDone();

      if (!result) {
        throw new Error('Failed to get analysis results from Form Recognizer.');
      }

      // Extract relevant data based on document type
      const extractedData = {
        keyValuePairResults: result.keyValuePairResults,
        tables: result.tables,
        // ... add other extraction logic as needed ...
      };

      return extractedData;
    }
  } catch (error: any) {
    console.error('Error analyzing file:', error);
    throw new Error('Failed to analyze file.');
  }
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <section className="file-upload-form">
      <h2>Upload File for Analysis</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="file-input">Choose a file to upload:</label>
          <input
            type="file"
            id="file-input"
            accept=".txt,.md,.json"
            onChange={handleFileChange}
            aria-label="File Input"
            required
          />
        </div>
        <button type="submit" className="btn btn-upload" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>
      {analysis && (
        <div className="analysis-result">
          <h3>Analysis Result</h3>
          <p>{analysis}</p>
        </div>
      )}
    </section>
  );
};

export default FileUploadForm;
