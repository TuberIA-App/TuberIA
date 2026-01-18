/**
 * @fileoverview Reusable button component with variants and sizes.
 * @module components/common/Button
 */

import React from 'react';
import './Button.css';

/**
 * Button component with customizable variants, sizes, and states.
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {'primary'|'secondary'|'tertiary'} [props.variant='primary'] - Visual style variant
 * @param {'small'|'medium'|'large'|'sm'|'md'|'lg'} [props.size='medium'] - Button size
 * @param {boolean} [props.fullWidth=false] - Whether button takes full container width
 * @param {function} [props.onClick] - Click handler
 * @param {'button'|'submit'|'reset'} [props.type='button'] - HTML button type
 * @param {boolean} [props.disabled=false] - Whether button is disabled
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} Styled button element
 */
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
