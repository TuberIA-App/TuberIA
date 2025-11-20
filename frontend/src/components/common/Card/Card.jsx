import React from 'react';
import './Card.css';

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
