import React, { useState } from 'react';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import fetchWithAuth from '../utils/fetchWithAuth';

const notyf = new Notyf();

const FileUploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      notyf.error('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetchWithAuth('/api/upload_file', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        notyf.success('File uploaded and analyzed successfully.');
        setFile(null);
        // Handle response data as needed
      } else {
        const errorData = await response.json();
        notyf.error(errorData.message || 'Failed to upload file.');
      }
    } catch (error: any) {
      notyf.error(error.message || 'Failed to upload file.');
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
            accept=".txt,.json,.md"
            onChange={handleFileChange}
            aria-label="File Input"
          />
        </div>
        <button type="submit" className="btn btn-upload">
          Upload File
        </button>
      </form>
    </section>
  );
};

export default FileUploadForm;