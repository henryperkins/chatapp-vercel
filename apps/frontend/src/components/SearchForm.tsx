import React, { useState } from 'react';
import fetchWithAuth from '../utils/fetchWithAuth';
import { Notyf } from 'notyf';

const notyf = new Notyf();

interface SearchResult {
  id: string;
  content: string;
}

const SearchForm: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) {
      notyf.error('Please enter a search query');
      return;
    }

    try {
      const response = await fetchWithAuth(`/api/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      } else {
        notyf.error('Failed to perform search');
      }
    } catch (error) {
      notyf.error('An error occurred while searching');
    }
  };

  return (
    <div className="search-form">
      <h2>Search Conversations</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search query"
        />
        <button type="submit">Search</button>
      </form>
      {results.length > 0 && (
        <div className="search-results">
          <h3>Search Results:</h3>
          <ul>
            {results.map((result) => (
              <li key={result.id}>{result.content}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchForm;