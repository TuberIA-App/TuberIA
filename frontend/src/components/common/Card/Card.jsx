/**
 * @fileoverview Reusable card component for content containers.
 * @module components/common/Card
 */

import React from 'react';
import './Card.css';

/**
 * Card component for displaying content in a contained format.
 * Supports images, headers, footers, and interactive states.
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card body content
 * @param {'default'|'elevated'|'outlined'} [props.variant='default'] - Visual style variant
 * @param {boolean} [props.hoverable=false] - Whether card has hover effect
 * @param {boolean} [props.interactive=false] - Whether card acts as a button
 * @param {'normal'|'compact'|'padded'} [props.padding='normal'] - Padding size
 * @param {React.ReactNode} [props.header] - Custom header content
 * @param {string} [props.title] - Card title text
 * @param {string} [props.subtitle] - Card subtitle text
 * @param {React.ReactNode} [props.footer] - Footer content
 * @param {string} [props.image] - Image URL
 * @param {string} [props.imageAlt=''] - Image alt text
 * @param {function} [props.onClick] - Click handler
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} Card container element
 */
const Card = ({
  children,
  variant = 'default',
  hoverable = false,
  interactive = false,
  padding = 'normal',
  header,
  title,
  subtitle,
  footer,
  image,
  imageAlt = '',
  onClick,
  className = '',
  ...props
}) => {
  const classes = [
    'card',
    `card--${variant}`,
    hoverable && 'card--hoverable',
    interactive && 'card--interactive',
    padding === 'compact' && 'card--compact',
    padding === 'padded' && 'card--padded',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={classes} 
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {image && (
        <img src={image} alt={imageAlt} className="card__image" />
      )}
      
      {(header || title || subtitle) && (
        <div className="card__header">
          {header || (
            <>
              {title && <h3 className="card__title">{title}</h3>}
              {subtitle && <p className="card__subtitle">{subtitle}</p>}
            </>
          )}
        </div>
      )}
      
      <div className="card__body">
        {children}
      </div>
      
      {footer && (
        <div className="card__footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
