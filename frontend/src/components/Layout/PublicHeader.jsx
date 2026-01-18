/**
 * @fileoverview Public header component for unauthenticated pages.
 * Shows only authentication actions (login/register).
 * @module components/Layout/PublicHeader
 */

import { useNavigate } from 'react-router-dom';
import './Header.css';

/**
 * Public header component displayed on unauthenticated pages.
 * Provides login and register navigation buttons.
 * @component
 * @returns {JSX.Element} Header with auth action buttons
 */
const PublicHeader = () => {
  const navigate = useNavigate();

  const handleLogin = () => navigate('/login', { state: { isLogin: true } });
  const handleRegister = () => navigate('/signup', { state: { isLogin: false } });

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__brand" />
        {/* En la home pública NO mostramos el nav de canales/dashboard,
            solo las acciones de autenticación */}
        <div className="header__actions">
          <button
            type="button"
            className="header__nav-item"
            onClick={handleLogin}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className="header__nav-item header__nav-item--active"
            onClick={handleRegister}
          >
            Registrarme
          </button>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
