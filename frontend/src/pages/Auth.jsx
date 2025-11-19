import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SparklesIcon, MailIcon, LockIcon, UserIcon } from 'lucide-react';
import Button from '../components/common/Button/Button';
import Input from '../components/common/Input/Input';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';
import './Auth.css';


const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const response = await authService.register({
          username: formData.name.replace(/\s+/g, '').toLowerCase(), // "testuser"
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        
        login(response.user, response.accessToken, response.refreshToken);
        navigate('/dashboard');
      } else {
        // REGISTRO
        const response = await authService.register({
          username: formData.name, // Usar name como username temporalmente
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        
        login(response.user, response.accessToken, response.refreshToken);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Error en la autenticación');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-page">
      <div className="auth-page__background" aria-hidden="true">
        <div className="auth-page__blur-circle auth-page__blur-circle--1"></div>
        <div className="auth-page__blur-circle auth-page__blur-circle--2"></div>
      </div>
      
      <div className="auth-container">
        <header className="auth-container__header">
          <Link to="/" className="auth-container__brand" aria-label="TuberIA - Volver al inicio">
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="3" y="3" width="34" height="34" rx="8" fill="#F53437" transform="rotate(-3 20 20)" />
              <path d="M16 13L27 20L16 27V13Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="31" cy="10" r="4" fill="#FFD93D" />
              <circle cx="31" cy="10" r="2.5" fill="#FFA500" />
            </svg>
            <span className="auth-container__brand-name">TuberIA</span>
          </Link>
        </header>

        <main className="auth-card">
          <div className="auth-card__header">
            <div className="auth-card__icon-wrapper">
              <SparklesIcon size={32} aria-hidden="true" />
            </div>
            <h1 className="auth-card__title">
              {isLogin ? '¡Bienvenido!' : 'Crea tu cuenta'}
            </h1>
            <p className="auth-card__subtitle">
              {isLogin ? 'Inicia sesión para continuar aprendiendo' : 'Regístrate gratis y empieza a resumir videos'}
            </p>
          </div>

          <div className="auth-card__tabs">
            <button onClick={() => setIsLogin(true)} className={`auth-card__tab ${isLogin ? 'auth-card__tab--active' : ''}`} role="tab" aria-selected={isLogin}>
              Iniciar sesión
            </button>
            <button onClick={() => setIsLogin(false)} className={`auth-card__tab ${!isLogin ? 'auth-card__tab--active' : ''}`} role="tab" aria-selected={!isLogin}>
              Registrarse
            </button>
          </div>

          {error && (
            <div style={{ 
              color: '#dc2626', 
              padding: '1rem', 
              marginBottom: '1rem',
              backgroundColor: '#fee2e2',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-card__form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name-input" className="form-group__label">Nombre completo</label>
                <div className="form-group__input-wrapper">
                  <UserIcon size={18} aria-hidden="true" />
                  <input 
                    id="name-input" 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Tu nombre" 
                    required={!isLogin}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email-input" className="form-group__label">Correo electrónico</label>
              <div className="form-group__input-wrapper">
                <MailIcon size={18} aria-hidden="true" />
                <input 
                  id="email-input" 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="tu@email.com" 
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password-input" className="form-group__label">Contraseña</label>
              <div className="form-group__input-wrapper">
                <LockIcon size={18} aria-hidden="true" />
                <input 
                  id="password-input" 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            {isLogin && (
              <div className="form-group__meta">
                <label className="form-group__checkbox-label">
                  <input type="checkbox" className="form-group__checkbox" />
                  Recordarme
                </label>
                <a href="#" className="form-group__meta-link">¿Olvidaste tu contraseña?</a>
              </div>
            )}

            <button 
              type="submit" 
              className="button button--primary button--full auth-card__submit-button"
              disabled={loading}
            >
              {loading ? 'Cargando...' : (isLogin ? 'Iniciar sesión' : 'Crear cuenta')}
            </button>
          </form>

          <div className="auth-card__divider">
            <span>O continúa con</span>
          </div>

          <div className="auth-card__social-logins">
            <button className="social-button" disabled={loading}>
              <img src="https://www.google.com/favicon.ico" alt="" className="social-button__icon" />
              Google
            </button>
            <button className="social-button" disabled={loading}>
              <img src="https://github.com/favicon.ico" alt="" className="social-button__icon" />
              GitHub
            </button>
          </div>

          {!isLogin && (
            <p className="auth-card__terms">
              Al registrarte, aceptas nuestros <a href="#">Términos de Servicio</a> y <a href="#">Política de Privacidad</a>.
            </p>
          )}
        </main>

        <footer className="auth-container__footer">
          <Link to="/" className="auth-container__back-link">← Volver al inicio</Link>
        </footer>
      </div>
    </div>
  );
};

export default Auth;
