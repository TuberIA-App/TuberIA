import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  ...props 
}) => {
  const classes = [
    'button',
    `button--${variant}`,
    size !== 'medium' && `button--${size}`,
    fullWidth && 'button--full',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
