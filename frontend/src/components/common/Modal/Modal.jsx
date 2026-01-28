/**
 * @fileoverview Accessible modal dialog component with focus trap.
 * @module components/common/Modal
 */

import React, { useEffect, useRef } from 'react';
import './Modal.css';

/**
 * Modal dialog component with accessibility features.
 * Implements focus trap, Escape key handling, and body scroll lock.
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {function} props.onClose - Close handler function
 * @param {string} [props.title] - Modal title text
 * @param {string} [props.subtitle] - Modal subtitle text
 * @param {React.ReactNode} props.children - Modal body content
 * @param {React.ReactNode} [props.footer] - Modal footer content
 * @returns {JSX.Element|null} Modal dialog or null when closed
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save the active element before opening the modal
    previousActiveElement.current = document.activeElement;

    // Function to handle focus trap
    const handleTabKey = (event) => {
      if (event.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // If Shift + Tab on first element, go to last
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // If Tab on last element, go to first
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Tab') {
        handleTabKey(event);
      }
    };

    // Configure the modal
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus the modal after a small delay to ensure the DOM is ready
    setTimeout(() => {
      modalRef.current?.focus();
    }, 10);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';

      // Restore focus to previous element
      if (previousActiveElement.current && previousActiveElement.current.focus) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal__overlay" 
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="modal__container"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={children ? "modal-content" : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="modal__close-button"
          aria-label="Cerrar modal"
        >
          ✕
        </button>
        
        {(title || subtitle) && (
          <div className="modal__header">
            {title && <h2 id="modal-title" className="modal__title">{title}</h2>}
            {subtitle && <p className="modal__subtitle">{subtitle}</p>}
          </div>
        )}
        
        <div id="modal-content" className="modal__body">
          {children}
        </div>
        
        {footer && (
          <div className="modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
