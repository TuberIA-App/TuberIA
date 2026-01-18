/**
 * @fileoverview Skip link component for keyboard accessibility.
 * @module components/common/SkipLink
 */

import React from 'react';
import './SkipLink.css';

/**
 * Skip link component for keyboard navigation.
 * Allows users to skip navigation and jump to main content.
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.targetId='main-content'] - ID of target element to skip to
 * @param {React.ReactNode} [props.children='Skip to main content'] - Link text
 * @returns {JSX.Element} Skip navigation link
 */
const SkipLink = ({ targetId = "main-content", children = "Skip to main content" }) => {
  return (
    <a href={`#${targetId}`} className="skip-link">
      {children}
    </a>
  );
};

export default SkipLink;
