import React, { useState } from 'react';
import PropTypes from 'prop-types';

function SearchBar({ onSearch }) {
  const [subject, setSubject] = useState('');

  const handleSearch = () => {
    onSearch(subject);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search by subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        data-testid="search-input"
      />
      <button onClick={handleSearch} data-testid="search-button">
        Search
      </button>
    </div>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
