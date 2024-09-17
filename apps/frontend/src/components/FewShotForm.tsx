import React, { useState } from 'react';
import { Notyf } from 'notyf';

const notyf = new Notyf();

const FewShotForm: React.FC = () => {
  const [examples, setExamples] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!examples.trim()) {
      notyf.error('Please provide at least one example');
      return;
    }

    try {
      // TODO: Implement the API call to send few-shot examples
      console.log('Few-shot examples:', examples);
      notyf.success('Few-shot examples submitted successfully');
      setExamples('');
    } catch (error) {
      notyf.error('An error occurred while submitting few-shot examples');
    }
  };

  return (
    <div className="few-shot-form">
      <h2>Few-Shot Learning</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={examples}
          onChange={(e) => setExamples(e.target.value)}
          placeholder="Enter few-shot examples, one per line"
          rows={5}
        />
        <button type="submit">Submit Examples</button>
      </form>
    </div>
  );
};

export default FewShotForm;