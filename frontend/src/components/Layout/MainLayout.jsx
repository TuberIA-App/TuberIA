/**
 * @fileoverview Main layout wrapper component.
 * Provides consistent header/footer structure for pages.
 * @module components/Layout/MainLayout
 */

import React from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * Main layout component that wraps page content.
 * Includes header, main content area, and footer.
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content to render
 * @returns {JSX.Element} Layout with header, content, and footer
 */
const MainLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default MainLayout;
