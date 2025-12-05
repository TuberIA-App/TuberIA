import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

const SearchBar = ({ placeholder, onChange, debounceMs = 600 }) => {
  const [inputValue, setInputValue] = useState('');
  const debounceTimerRef = useRef(null);
  const onChangeRef = useRef(onChange);

  // Keep onChange ref updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set up new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      onChangeRef.current(inputValue);
    }, debounceMs);

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, debounceMs]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        className="search-bar__input"
        aria-label={placeholder}
      />
    </div>
  );
};

export default SearchBar;
