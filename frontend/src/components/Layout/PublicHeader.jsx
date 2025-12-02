import { useNavigate } from 'react-router-dom';
import './Header.css';

const PublicHeader = () => {
  const navigate = useNavigate();

  const handleLogin = () => navigate('/login', { state: { isLogin: true } });
  const handleRegister = () => navigate('/login', { state: { isLogin: false } });

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
