// File: apps/frontend/src/components/FileUploadForm.tsx

import React, { useState } from 'react';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import fetchWithAuth from '../utils/fetchWithAuth';
import { API_BASE_URL } from '../utils/config';
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
      const response = await fetch(`${API_BASE_URL}/api/upload_file`, {
        method: 'POST',
        body: formData,
        // No need to set 'Content-Type' header; browser sets it automatically for FormData
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysis(data.analysis);
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