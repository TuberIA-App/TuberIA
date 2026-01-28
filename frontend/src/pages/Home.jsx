/**
 * @fileoverview Public landing page component.
 * Displays features, how it works, and channel search demo.
 * @module pages/Home
 */

import React, { useState, useEffect, useRef } from 'react';
import * as Sentry from '@sentry/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, SparklesIcon, ClockIcon, TrendingUpIcon, ZapIcon, CheckCircleIcon, UsersIcon, PlayCircleIcon, BookOpenIcon, XIcon, SearchIcon } from 'lucide-react';
import Button from '../components/common/Button/Button';
import Input from '../components/common/Input/Input';
import Card from '../components/common/Card/Card';
import Modal from '../components/common/Modal/Modal';
import PublicHeader from '../components/Layout/PublicHeader';
import channelService from '../services/channel.service';
import './Home.css';

/**
 * Public landing page component.
 * Showcases app features, testimonials, and allows channel search demo.
 * @component
 * @returns {JSX.Element} Landing page with hero, features, and CTA sections
 */
const Home = () => {
  const [showTryModal, setShowTryModal] = useState(false);
  const [demoUrl, setDemoUrl] = useState('');
  const [demoChannel, setDemoChannel] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState('');
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const [previewChannel, setPreviewChannel] = useState(null);

  // Datos de ejemplo
  const featuredVideos = [
    { id: '1', title: 'Cómo la IA está transformando el desarrollo de software', channelName: 'Tech Insights', thumbnail: 'https://i.pravatar.cc/400?u=1', duration: '15:42' },
    { id: '2', title: 'Guía completa de React Hooks en 2024', channelName: 'Dev Academy', thumbnail: 'https://i.pravatar.cc/400?u=2', duration: '22:18' },
    { id: '3', title: 'Machine Learning para principiantes', channelName: 'AI Learning', thumbnail: 'https://i.pravatar.cc/400?u=3', duration: '18:30' },
    { id: '4', title: 'Diseño de interfaces modernas', channelName: 'Design Pro', thumbnail: 'https://i.pravatar.cc/400?u=4', duration: '12:55' }
  ];
  const features = [
    { icon: ZapIcon, title: 'Sigue canales fácilmente', description: 'Encuentra y sigue tus canales de YouTube favoritos en un solo lugar.' },
    { icon: BookOpenIcon, title: 'Resúmenes automáticos', description: 'Accede a resúmenes de IA de todos los videos de tus canales seguidos.' },
    { icon: ClockIcon, title: 'Ahorra tiempo', description: 'Mantente al día con tus creadores sin ver horas de contenido.' },
    { icon: TrendingUpIcon, title: 'Organización inteligente', description: 'Todos tus canales y resúmenes organizados en un dashboard personal.' }
  ];
  const benefits = [
    'Sigue todos tus canales favoritos en un solo lugar.',
    'Resúmenes automáticos con IA de cada video publicado.',
    'Ahorra hasta un 80% de tu tiempo de visualización.',
    'Organiza y accede a resúmenes por canal fácilmente.',
    'Notificaciones cuando tus canales publiquen nuevo contenido.'
  ];

  const handleTryNow = () => setShowTryModal(true);
  const handleCloseModal = () => {
    setShowTryModal(false);
    setPreviewChannel(null);
  };

    const handleRegister = () => {
    navigate('/signup', { state: { isLogin: false } });
  };

  const handleLogin = () => {
    navigate('/login', { state: { isLogin: true } });
  };

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    if (!demoUrl.trim() || demoUrl.trim().length < 2) {
      setDemoError('Escribe al menos 2 caracteres');
      return;
    }

    setDemoLoading(true);
    setDemoError('');
    setDemoChannel(null);

    try {
      const channelData = await channelService.searchChannel(demoUrl.trim());
      setDemoChannel(channelData);
    } catch (err) {
      setDemoError(err.message || 'No se puede conectar con el servidor. Inténtalo más tarde.');
      Sentry.captureException(err, { extra: { context: 'demoChannelSearch', query: demoUrl } });
    } finally {
      setDemoLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') handleCloseModal();
    };
    if (showTryModal) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.classList.add('modal-open');
      modalRef.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
    };
  }, [showTryModal]);

  return (
    <>
      <PublicHeader />
    <main className="home-page">
      {/* Hero Section */}
            {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__background-decoration" aria-hidden="true">
          <div className="hero__blur-circle hero__blur-circle--1"></div>
          <div className="hero__blur-circle hero__blur-circle--2"></div>
        </div>
        <div className="hero__content">
          <div className="hero__badge">
            <SparklesIcon size={16} aria-hidden="true" />
            Potenciado por Inteligencia Artificial
          </div>
          <h1 id="hero-title" className="hero__title">
            Todos tus canales de YouTube, <span className="hero__title--highlight">resumidos al instante</span>
          </h1>
          <p className="hero__subtitle">
            Sigue tus canales favoritos en TuberIA y accede a resúmenes automáticos de cada video. Aprende más en menos tiempo con la ayuda de nuestra IA avanzada.
          </p>
          <div className="hero__actions">
            <Link to="/signup" className="button button--primary button--large">
              Comenzar gratis <ArrowRightIcon size={20} aria-hidden="true" />
            </Link>
            <Button 
              onClick={handleTryNow} 
              variant="secondary" 
              size="large"
            >
              <PlayCircleIcon size={20} aria-hidden="true" /> Pruébalo ahora
            </Button>
          </div>
        </div>
        <div className="hero__stats">
          <ul className="hero__stats-list" aria-label="Estadísticas clave de TuberIA">
            <li className="hero__stats-item">
              <p className="hero__stats-number">10K+</p>
              <p className="hero__stats-label">Videos resumidos</p>
            </li>
            <li className="hero__stats-item">
              <p className="hero__stats-number">95%</p>
              <p className="hero__stats-label">Precisión de resúmenes</p>
            </li>
            <li className="hero__stats-item">
              <p className="hero__stats-number">2.5K+</p>
              <p className="hero__stats-label">Usuarios activos</p>
            </li>
          </ul>
        </div>
      </section>

      {/* Interactive Try Section */}
      <section className="try-it" aria-labelledby="try-it-title">
        <div className="try-it__content">
          <h2 id="try-it-title" className="try-it__title">Descubre cómo funciona</h2>
          <p className="try-it__subtitle">Busca canales, síguelos y accede a resúmenes automáticos de todos sus videos.</p>
          <div className="try-it__form-container">
            <form onSubmit={handleDemoSubmit} className="try-it__form" aria-labelledby="try-it-title">
              <Input
                id="channel-search"
                type="text"
                placeholder="Busca un canal de YouTube..."
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                icon={<SearchIcon size={20} />}
                iconPosition="left"
                required
                aria-label="Buscar canal de YouTube"
              />
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth
              >
                Buscar canales
              </Button>
            </form>
            <div className="try-it__prompt">
              <p className="try-it__prompt-title">¿Cómo funciona?</p>
              <p className="try-it__prompt-text">Busca tus canales favoritos, síguelos y accede a resúmenes automáticos de cada video publicado.</p>
            </div>
            {demoError && (
              <p className="try-it__error">
                {demoError}
              </p>
            )}

            {demoChannel && (
              <div className="try-it__result">
                <div className="try-it__result-header">
                  {demoChannel.thumbnail && (
                    <img
                      src={demoChannel.thumbnail}
                      alt={demoChannel.name}
                      className="try-it__result-thumbnail"
                    />
                  )}
                  <div>
                    <h3 className="try-it__result-name">{demoChannel.name}</h3>
                    <p className="try-it__result-username">
                      {demoChannel.username || 'Username no disponible'}
                    </p>
                    <p className="try-it__result-id"> ID del canal: <span>{demoChannel.channelId}</span></p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    setPreviewChannel(demoChannel);
                    setShowTryModal(true);
                  }}
                >
                  Probar TuberIA con este canal
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="features" aria-labelledby="features-title">
        <header className="features__header">
          <h2 id="features-title" className="features__title">Todo lo que necesitas para aprender más rápido</h2>
          <p className="features__subtitle">Herramientas potentes diseñadas para maximizar tu productividad y aprendizaje.</p>
        </header>
        <div className="features__grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article key={index} className="feature-card">
                <div className="feature-card__icon-wrapper">
                  <Icon size={28} aria-hidden="true" />
                </div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__description">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works" aria-labelledby="how-it-works-title">
        <header className="how-it-works__header">
          <h2 id="how-it-works-title" className="how-it-works__title">Así de simple funciona</h2>
          <p className="how-it-works__subtitle">Tres pasos para mantenerte al día con tus creadores favoritos.</p>
        </header>
        <div className="how-it-works__steps">
          <div className="how-it-works__line" aria-hidden="true"></div>
          <ol className="how-it-works__list" aria-label="Pasos para usar la aplicación">
            <li className="how-it-works__item">
              <div className="how-it-works__number">1</div>
              <article className="how-it-works__card">
                <h3 className="how-it-works__card-title">Busca y sigue canales</h3>
                <p>Encuentra tus canales de YouTube favoritos y síguelos con un solo clic.</p>
              </article>
            </li>
            <li className="how-it-works__item">
              <div className="how-it-works__number">2</div>
              <article className="how-it-works__card">
                <h3 className="how-it-works__card-title">Resúmenes automáticos</h3>
                <p>Nuestra IA genera resúmenes de todos los videos de tus canales seguidos.</p>
              </article>
            </li>
            <li className="how-it-works__item">
              <div className="how-it-works__number">3</div>
              <article className="how-it-works__card">
                <h3 className="how-it-works__card-title">Accede y aprende</h3>
                <p>Explora resúmenes organizados por canal y mantente al día sin perder tiempo.</p>
              </article>
            </li>
          </ol>
        </div>
      </section>

      {/* Featured Videos Section */}
      <section className="featured-videos" aria-labelledby="featured-videos-title">
        <header className="featured-videos__header">
          <div className="featured-videos__headings">
            <h2 id="featured-videos-title" className="featured-videos__title">Resúmenes destacados</h2>
            <p className="featured-videos__subtitle">Los videos más populares resumidos por nuestra comunidad.</p>
          </div>
          <Link to="/dashboard" className="featured-videos__link">
            Ver todos <ArrowRightIcon size={20} aria-hidden="true" />
          </Link>
        </header>
        <ul className="featured-videos__grid" aria-labelledby="featured-videos-title">
        </ul>
      </section>

      {/* Benefits Section */}
      <section className="benefits" aria-labelledby="benefits-title">
        <div className="benefits__grid">
          <div className="benefits__content">
            <h2 id="benefits-title" className="benefits__title">¿Por qué elegir TuberIA?</h2>
            <p className="benefits__subtitle">Diseñado para estudiantes, profesionales y creadores de contenido que valoran su tiempo.</p>
            <ul className="benefits__list" aria-label="Beneficios de TuberIA">
              {benefits.map((benefit, index) => (
                <li key={index} className="benefits__item">
                  <CheckCircleIcon className="benefits__item-icon" size={24} aria-hidden="true" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup" className="button button--primary button--large benefits__cta">
              Empezar gratis ahora <ArrowRightIcon size={20} aria-hidden="true" />
            </Link>
          </div>
          <aside className="benefits__testimonials" aria-label="Testimonios de usuarios">
            <div className="benefits__testimonials-decoration" aria-hidden="true"></div>
            <div className="benefits__testimonials-content benefits__testimonials-content--glow">
              <header className="benefits__testimonials-header">
                <div className="benefits__testimonials-icon-wrapper">
                  <UsersIcon size={32} aria-hidden="true" />
                </div>
                <div>
                  <p className="benefits__testimonials-count">2,500+</p>
                  <p className="benefits__testimonials-label">Usuarios satisfechos</p>
                </div>
              </header>
              <ul className="benefits__testimonials-list" aria-label="Lista de testimonios">
                <li>
                  <figure className="testimonial-card">
                    <blockquote>
                      <p className="testimonial-card__rating">
                        <span className="sr-only">5 de 5 estrellas</span>
                        <span aria-hidden="true">★★★★★</span>
                      </p>
                      <p className="testimonial-card__text">"TuberIA me ha ayudado a aprender mucho más rápido. Los resúmenes son increíblemente precisos."</p>
                    </blockquote>
                    <figcaption className="testimonial-card__author">- María González</figcaption>
                  </figure>
                </li>
                <li>
                  <figure className="testimonial-card">
                    <blockquote>
                      <p className="testimonial-card__rating">
                        <span className="sr-only">5 de 5 estrellas</span>
                        <span aria-hidden="true">★★★★★</span>
                      </p>
                      <p className="testimonial-card__text">"Herramienta imprescindible para cualquier estudiante. Me ahorra horas cada semana."</p>
                    </blockquote>
                    <figcaption className="testimonial-card__author">- Carlos Ruiz</figcaption>
                  </figure>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta" aria-labelledby="cta-title">
        <div className="cta__content">
          <h2 id="cta-title" className="cta__title">Comienza a aprender más rápido hoy</h2>
          <p className="cta__subtitle">Únete a miles de usuarios que ya están transformando su forma de aprender con TuberIA.</p>
          <div className="cta__actions">
            <Link to="/signup" className="button button--white button--xlarge">
              Empezar gratis <ArrowRightIcon size={22} aria-hidden="true" />
            </Link>
            <Link to="/dashboard" className="button button--outline-white button--xlarge">
              Ver canales
            </Link>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showTryModal && (
        <div
          className="modal__overlay"
          onClick={handleCloseModal}
          role="presentation"
        >
          <div
            ref={modalRef}
            className="modal__container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <Button 
              onClick={handleCloseModal} 
              className="modal__close-button" 
              aria-label="Cerrar modal"
              variant="secondary"
            >
              <XIcon size={24} aria-hidden="true" />
            </Button>
            <header className="modal__header">
              <div className="modal__icon-wrapper">
                <SparklesIcon size={40} aria-hidden="true" />
              </div>
              <h3 id="modal-title" className="modal__title">
                {previewChannel
                  ? `Empieza a seguir a ${previewChannel.name}`
                  : '¡Empieza a seguir canales!'}
              </h3>
              <p className="modal__subtitle">Regístrate gratis para seguir tus canales favoritos y acceder a sus resúmenes.</p>
            </header>
            <ul className="modal__features-list" aria-label="Beneficios de registrarse">
              <li className="modal__feature-item">
                <CheckCircleIcon size={24} aria-hidden="true" />
                <span>Sigue canales ilimitados</span>
              </li>
              <li className="modal__feature-item">
                <CheckCircleIcon size={24} aria-hidden="true" />
                <span>Resúmenes automáticos de IA</span>
              </li>
            </ul>
            <Button 
              onClick={handleRegister}
              variant="primary"
              size="large"
              fullWidth
            >
              Registrarse gratis
            </Button>
            <p className="modal__login-prompt">
              ¿Ya tienes cuenta? <button onClick={handleLogin} className="modal__login-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Inicia sesión</button>
            </p>
          </div>
        </div>
      )}
    </main>
  </>
  );
};

export default Home;
