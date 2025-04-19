import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/SearchBar.module.css';
import { useRouter } from 'next/router';

function SearchBar({ onSearch = () => {} }) {
  const [subject, setSubject] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (subject.trim() !== '') {
      onSearch(subject);
      router.push(`/Search?q=${encodeURIComponent(subject)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Search by subject, name, language, availability..."
        value={subject}
        onChange={(e) => {
          setSubject(e.target.value);
          onSearch(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        className={styles.searchInput}
      />

      <button
        onClick={handleSearch}
        data-testid="search-button"
        className={styles.searchButton}
        aria-label="Search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 20"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 19l-4-4m0 0a7 7 0 1114 0 7 7 0 01-14 0z"
          />
        </svg>
      </button>
    </div>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func,
};

export default SearchBar;
