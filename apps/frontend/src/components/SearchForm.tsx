// File: apps/frontend/src/components/SearchForm.tsx

import React, { useState } from 'react';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import fetchWithAuth from '../utils/fetchWithAuth';

// Import Font Awesome components and icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Conversation } from '@/types/models';

const notyf = new Notyf();

const SearchForm: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      notyf.error('Please enter a search query.');
      return;
    }

    setLoading(true);
    setSearchResults([]);

    try {
      const data = await fetchWithAuth('/api/search_conversations', {
        method: 'POST',
        body: JSON.stringify({ query: searchQuery.trim() }),
      });

      setSearchResults(data.results);
    } catch (error: any) {
      notyf.error(error.message || 'Failed to perform search.');
    } finally {
      setLoading(false);
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
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </form>

      {loading && <p>Searching...</p>}

      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          <ul>
            {searchResults.map((result) => (
              <li key={result.conversation_id}>
                <button onClick={() => window.location.href = `/?conversationId=${result.conversation_id}`}>
                  {result.title || `Conversation ${result.conversation_id.slice(0, 8)}`}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default SearchForm;
