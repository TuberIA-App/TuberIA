/**
 * @fileoverview Search bar component with debounced input.
 * @module components/SearchBar
 */

import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

/**
 * Search bar component with built-in debouncing.
 * Delays onChange callback to reduce API calls during typing.
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.placeholder] - Input placeholder text
 * @param {function} props.onChange - Callback with debounced search value
 * @param {number} [props.debounceMs=600] - Debounce delay in milliseconds
 * @returns {JSX.Element} Search input with debouncing
 */
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
