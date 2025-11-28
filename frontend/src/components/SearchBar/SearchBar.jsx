import React from 'react';
import './SearchBar.css';

const SearchBar = ({ placeholder, onChange }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        className="search-bar__input"
        aria-label={placeholder}
      />
    </div>
  );
};

export default SearchBar;
