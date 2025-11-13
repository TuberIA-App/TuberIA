import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { BellIcon, UserIcon, HomeIcon, TrendingUpIcon, UsersIcon, FileTextIcon } from 'lucide-react';
import Logo from '../common/Logo/Logo';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  const navItems = [
    { path: '/home', label: 'Inicio', icon: HomeIcon },
    { path: '/video', label: 'Resúmenes', icon: FileTextIcon },
    { path: '/dashboard', label: 'Canales', icon: TrendingUpIcon },
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
          <button className="header__action-button" aria-label="Ver notificaciones">
            <BellIcon size={20} />
          </button>
          <button className="header__action-button" aria-label="Ver perfil de usuario">
            <UserIcon size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
