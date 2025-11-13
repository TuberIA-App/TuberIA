import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

const Logo = ({
  size = 'md',
  to = '/',
  className = '',
  showText = true
}) => {
  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 48
  };

  const svgSize = sizeMap[size] || sizeMap.md;

  return (
    <Link to={to} className={`logo ${className}`} aria-label="TuberIA - Volver al inicio">
      <svg
        className="logo__icon"
        width={svgSize}
        height={svgSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="34" height="34" rx="8" fill="#F53437" transform="rotate(-3 20 20)" />
        <path d="M16 13L27 20L16 27V13Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="31" cy="10" r="4" fill="#FFD93D" />
        <circle cx="31" cy="10" r="2.5" fill="#FFA500" />
      </svg>
      {showText && <span className="logo__text">TuberIA</span>}
    </Link>
  );
};

export default Logo;
