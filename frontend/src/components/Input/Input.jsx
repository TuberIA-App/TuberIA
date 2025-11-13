import React, { useState } from 'react';
import './Input.css';

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  size = 'medium',
  multiline = false,
  rows = 3,
  id,
  name,
  className = '',
  ...props
}) => {
  const [inputId] = useState(id || `input-${Math.random().toString(36).substr(2, 9)}`);

  const inputClasses = [
    'input',
    icon && `input--with-icon-${iconPosition}`,
    error && 'input--error',
    !error && value && 'input--success',
    size !== 'medium' && `input--${size}`,
    className
  ].filter(Boolean).join(' ');

  const InputElement = multiline ? 'textarea' : 'input';

  return (
    <div className="input-wrapper">
      {label && (
        <label 
          htmlFor={inputId} 
          className={`input-label ${required ? 'input-label--required' : ''}`}
        >
          {label}
        </label>
      )}
      
      <div className="input-container">
        {icon && iconPosition === 'left' && (
          <span className="input-icon">{icon}</span>
        )}
        
        <InputElement
          id={inputId}
          name={name}
          type={multiline ? undefined : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={multiline ? rows : undefined}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <span className="input-icon input-icon--right">{icon}</span>
        )}
      </div>
      
      {error && (
        <p id={`${inputId}-error`} className="input-error-text" role="alert">
          ⚠️ {error}
        </p>
      )}
      
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="input-helper-text">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
