/**
 * @fileoverview Application header component with navigation and user actions.
 * Displays main navigation, user info, and authentication actions.
 * @module components/Layout/Header
 */

import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { BellIcon, UserIcon, HomeIcon, TrendingUpIcon, UsersIcon, FileTextIcon } from 'lucide-react';
import Logo from '../common/Logo/Logo';
import './Header.css';

import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button/Button';

/**
 * Main application header component.
 * Provides navigation, user greeting, and authentication controls.
 * @component
 * @returns {JSX.Element} Header with navigation and user actions
 */
const Header = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const { isAuthenticated, user, logout } = useAuth();
  const isActive = (path) => location.pathname.startsWith(path);

  /**
   * Handles user logout and redirects to home page.
   */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /**
   * Navigation menu items configuration.
   * @type {Array<{path: string, label: string, icon: React.ComponentType}>}
   */
  const navItems = [
  { path: '/dashboard', label: 'Inicio', icon: HomeIcon }, 
  { path: '/home', label: 'Canales', icon: TrendingUpIcon },
  { path: '/channels', label: 'Buscar', icon: UsersIcon }
  ];

  return (
    <header className="header">
      <div className="header__container">
        <Logo to="/home" className="header__brand" size="md" />

        <nav className="header__nav" aria-label="Navegación principal">
          <ul className="header__nav-list" aria-label="Menú principal">
            {navItems.map(item => {
              const Icon = item.icon;
              const itemClass = `header__nav-item ${isActive(item.path) ? 'header__nav-item--active' : ''}`;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={itemClass}
                    aria-current={isActive(item.path) ? "page" : undefined}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="header__actions">
          {isAuthenticated ? (
            <div className="header__user-chip">
              <div className="header__user-info">
                <UserIcon size={18} aria-hidden="true" />
                <div className="header__user-text">
                  <span className="header__user-greeting">Hola,</span>
                  <span className="header__user-name">{user.name}</span>
                </div>
              </div>
              <Button 
                variant="tertiary" 
                size="sm"
                onClick={handleLogout}
                aria-label="Cerrar sesión"
              >
                Salir
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login" state={{ isLogin: true }} className="button button--secondary">
                Entrar
              </Link>
              <Link to="/login" state={{ isLogin: false }} className="button button--primary">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
