import React from 'react';
import './SkipLink.css';

const SkipLink = ({ targetId = "main-content", children = "Saltar al contenido principal" }) => {
  return (
    <a href={`#${targetId}`} className="skip-link">
      {children}
    </a>
  );
};

export default SkipLink;
