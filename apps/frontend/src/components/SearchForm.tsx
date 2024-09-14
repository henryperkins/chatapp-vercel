import React, { useState } from 'react';
import fetchWithAuth from '../utils/fetchWithAuth';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const notyf = new Notyf();

const SearchForm: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      notyf.error('Please enter a search query.');
      return;
    }

    try {
      const response = await fetchWithAuth('/api/search_conversations', {
        method: 'POST',
        body: JSON.stringify({ query: searchQuery.trim() }),
      });

      const data = await response.json();
      setSearchResults(data.results);
    } catch (error: any) {
      notyf.error(error.message || 'Failed to perform search.');
    }
  };

  return (
    <section className="search-form">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          aria-label="Search Conversations"
        />
        <button type="submit" className="btn-search" aria-label="Search">
          <i className="fas fa-search"></i>
        </button>
      </form>

      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          <ul>
            {searchResults.map((result, index) => (
              <li key={index}>
                {/* Display search result items */}
                {result.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default SearchForm;