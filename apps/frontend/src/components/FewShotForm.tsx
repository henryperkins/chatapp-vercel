// File: apps/frontend/src/components/FewShotForm.tsx

import React, { useState } from 'react';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import fetchWithAuth from '../utils/fetchWithAuth';

const notyf = new Notyf();

const FewShotForm: React.FC = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userPrompt.trim() || !assistantResponse.trim()) {
      notyf.error('Both user prompt and assistant response are required.');
      return;
    }

    try {
      await fetchWithAuth('/api/add_few_shot_example', {
        method: 'POST',
        body: JSON.stringify({
          user_prompt: userPrompt.trim(),
          assistant_response: assistantResponse.trim(),
        }),
      });

      notyf.success('Few-shot example added successfully.');
      setUserPrompt('');
      setAssistantResponse('');
    } catch (error: any) {
      notyf.error(error.message || 'Failed to add few-shot example.');
    }
  };

  return (
    <section className="few-shot-form">
      <h2>Add Few-Shot Example</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="user-prompt">User Prompt:</label>
          <input
            type="text"
            id="user-prompt"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Enter User Prompt"
            aria-label="User Prompt"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="assistant-response">Assistant Response:</label>
          <input
            type="text"
            id="assistant-response"
            value={assistantResponse}
            onChange={(e) => setAssistantResponse(e.target.value)}
            placeholder="Enter Assistant Response"
            aria-label="Assistant Response"
            required
          />
        </div>
        <button type="submit" className="btn btn-add">
          Add Example
        </button>
      </form>
    </section>
  );
};

export default FewShotForm;