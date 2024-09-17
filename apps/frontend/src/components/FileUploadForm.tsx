import React, { useState } from 'react';
import fetchWithAuth from '../utils/fetchWithAuth';
import { Notyf } from 'notyf';

const notyf = new Notyf();

const FileUploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetchWithAuth('/api/upload_file', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        notyf.success(data.message || 'File uploaded successfully');
        setFile(null);
        setError(null);
      } else {
        setError(data.error || 'Failed to upload file');
        notyf.error(data.error || 'Failed to upload file');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while uploading the file';
      setError(errorMessage);
      notyf.error(errorMessage);
    }
  };

  return (
    <div className="file-upload-form">
      <h2>Upload File</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit" disabled={!file}>
          Upload
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FileUploadForm;
