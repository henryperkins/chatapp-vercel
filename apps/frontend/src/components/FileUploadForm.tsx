// FileUploadForm.tsx
import React, { useState } from 'react';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import fetchWithAuth from '../utils/fetchWithAuth';
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

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);

    try {
      const response = await fetchWithAuth('/api/upload_file', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysis(JSON.stringify(data.analysis, null, 2)); // Display the analysis results
        notyf.success('File uploaded and analyzed successfully.');
        setFile(null);
      } else {
        notyf.error(data.message || 'Failed to upload file.');
      }
    } catch (error: any) {
      notyf.error(error.message || 'Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  // ... (rest of the component: handleFileChange, JSX)
};

export default FileUploadForm;
