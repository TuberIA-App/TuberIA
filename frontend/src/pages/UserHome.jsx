import React from 'react';
import { Link } from 'react-router-dom';
import VideoCard from '../components/common/VideoCard/VideoCard';
import { SparklesIcon, TrendingUpIcon, ClockIcon, BookmarkIcon } from 'lucide-react';
import './UserHome.css';

const UserHome = () => {
  // Datos de ejemplo
  const recentVideos = [
    { id: '1', title: 'Cómo la IA está transformando el desarrollo de software', channelName: 'Tech Insights', thumbnail: 'https://i.pravatar.cc/400?u=1', duration: '15:42' },
    { id: '2', title: 'Guía completa de React Hooks en 2024', channelName: 'Dev Academy', thumbnail: 'https://i.pravatar.cc/400?u=2', duration: '22:18' },
    { id: '3', title: 'Machine Learning para principiantes', channelName: 'AI Learning', thumbnail: 'https://i.pravatar.cc/400?u=3', duration: '18:30' }
  ];
  const savedVideos = [
    { id: '4', title: 'Diseño de interfaces modernas con Tailwind CSS', channelName: 'Design Pro', thumbnail: 'https://i.pravatar.cc/400?u=4', duration: '12:55' }
  ];

  const stats = [
    { label: 'Resúmenes leídos', value: '24', icon: BookmarkIcon },
    { label: 'Tiempo ahorrado', value: '8.5h', icon: ClockIcon },
    { label: 'Canales seguidos', value: '4', icon: TrendingUpIcon }
  ];

  return (
    <main className="user-home">
      <header className="user-home__welcome-banner">
        <div className="user-home__welcome-title-group">
          <SparklesIcon size={30} className="user-home__welcome-icon" aria-hidden="true" />
          <h1 className="user-home__welcome-title">¡Bienvenido de nuevo!</h1>
        </div>
        <p className="user-home__welcome-subtitle">
          Continúa aprendiendo con los últimos resúmenes de tus canales favoritos.
        </p>
      </header>

      <section aria-label="Estadísticas rápidas">
        <ul className="user-home__stats-grid">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <li key={stat.label} className="stat-card">
                <div className="stat-card__header">
                  <h2 className="stat-card__label">{stat.label}</h2>
                  <Icon size={20} className="stat-card__icon" aria-hidden="true" />
                </div>
                <p className="stat-card__value">{stat.value}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="user-home__video-section" aria-labelledby="recent-videos-title">
        <header className="video-section__header">
          <div>
            <h2 id="recent-videos-title" className="video-section__title">Resúmenes recientes</h2>
            <p className="video-section__subtitle">Los últimos videos de tus canales.</p>
          </div>
          <Link to="/dashboard" className="video-section__view-all">Ver todos</Link>
        </header>
        <ul className="video-section__grid">
          {recentVideos.map(video => (
            <li key={video.id}><VideoCard {...video} /></li>
          ))}
        </ul>
      </section>

      <section className="user-home__video-section" aria-labelledby="saved-videos-title">
        <header className="video-section__header">
          <div>
            <h2 id="saved-videos-title" className="video-section__title">Guardados</h2>
            <p className="video-section__subtitle">Tus resúmenes favoritos.</p>
          </div>
        </header>
        <ul className="video-section__grid">
          {savedVideos.map(video => (
            <li key={video.id}><VideoCard {...video} /></li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default UserHome;
