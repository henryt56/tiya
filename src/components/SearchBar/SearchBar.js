import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './SearchBar.module.css';
import { useRouter } from 'next/router';

function SearchBar({ onSearch = () => {} }) { // 👈 DEFAULT PROP FIX
  const [subject, setSubject] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (subject.trim() !== '') {
      onSearch(subject);
      router.push(`/Search?q=${encodeURIComponent(subject)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={styles.searchContainer}>
      <svg
        className={styles.searchIcon}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        placeholder="Search by subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        onKeyDown={handleKeyDown}
        data-testid="search-input"
        className={styles.searchInput}
      />
      <button
        onClick={handleSearch}
        data-testid="search-button"
        className={styles.searchButton}
      >
        Search
      </button>
    </div>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func,
};

export default SearchBar;
