/**
 * @fileoverview User home/dashboard page showing stats and recent videos.
 * Provides overview of user activity and quick access to content.
 * @module pages/UserHome
 */

import React, { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { Link } from 'react-router-dom';
import VideoCard from '../components/common/VideoCard/VideoCard';
import { SparklesIcon, TrendingUpIcon, ClockIcon, BookmarkIcon, Loader2Icon, AlertCircleIcon, SearchIcon } from 'lucide-react';
import userService from '../services/user.service';
import videoService from '../services/video.service';
import './UserHome.css';

/**
 * User home dashboard component.
 * Displays user statistics, recent video summaries, and navigation.
 * @component
 * @returns {JSX.Element} Dashboard with stats and recent content
 */
const UserHome = () => {
  const [stats, setStats] = useState({
    summariesRead: 0,
    timeSaved: '0h 0m',
    followedChannels: 0
  });
  const [recentVideos, setRecentVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statsDisplay = [
    { label: 'Resúmenes leídos', value: stats.summariesRead.toString(), icon: BookmarkIcon },
    { label: 'Tiempo ahorrado', value: stats.timeSaved, icon: ClockIcon },
    { label: 'Canales seguidos', value: stats.followedChannels.toString(), icon: TrendingUpIcon }
  ];

  // Helper to format duration from seconds to MM:SS
  const formatDuration = (totalSeconds) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
      return '00:00';
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch stats, videos, and channels in parallel
        const [statsData, videosData, channelsData] = await Promise.all([
          userService.getStats(),
          videoService.getMyVideos({ limit: 6, status: 'completed' }),
          userService.getMyChannels()
        ]);

        setStats(statsData);
        setRecentVideos(videosData.videos || []);
        setChannels(channelsData.channels || []);
      } catch (err) {
        Sentry.captureException(err, { extra: { context: 'loadUserHomeData' } });
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create a map for quick channel name lookup
  const channelNameMap = new Map(channels.map(c => [c.id, c.name]));

  if (loading) {
    return (
      <main className="user-home">
        <div className="user-home__loading">
          <Loader2Icon size={48} className="user-home__loading-icon" aria-hidden="true" />
          <p>Cargando tu dashboard...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="user-home">
        <div className="user-home__error">
          <AlertCircleIcon size={48} className="user-home__error-icon" aria-hidden="true" />
          <h2>Error al cargar el dashboard</h2>
          <p>{error}</p>
          <button 
            className="user-home__retry-button"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

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

      {/* Complete empty state - user with no channels */}
      {stats.summariesRead === 0 && stats.followedChannels === 0 && !loading ? (
        <div className="user-home__empty-state">
          <SearchIcon size={64} className="user-home__empty-icon" aria-hidden="true" />
          <h2 className="user-home__empty-title">¡Comienza tu viaje de aprendizaje!</h2>
          <p className="user-home__empty-text">
            Busca y sigue tus canales favoritos de YouTube para empezar a recibir resúmenes automáticos.
          </p>
          <Link to="/channels" className="button button--primary button--large">
            <SearchIcon size={20} aria-hidden="true" />
            Descubrir canales
          </Link>
        </div>
      ) : (
        <>
          <section aria-label="Estadísticas rápidas">
            <ul className="user-home__stats-grid">
              {statsDisplay.map(stat => {
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
              <Link to="/feed" className="video-section__view-all">Ver todos</Link>
            </header>
            {recentVideos.length === 0 ? (
              <div className="video-section__empty">
                <p>No hay resúmenes disponibles todavía.</p>
                <p>Los videos se procesarán automáticamente cuando tus canales publiquen nuevo contenido.</p>
              </div>
            ) : (
              <ul className="video-section__grid">
                {recentVideos.map(video => (
                  <li key={video._id || video.id}>
                    <VideoCard
                      id={video.videoId}
                      title={video.title || 'Video sin título'}
                      channelName={channelNameMap.get(video.channelId) || 'Canal desconocido'}
                      thumbnail={video.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgc3R5bGU9ImZpbGw6I2NjY2NjYyIvPjwvc3ZnPg=='}
                      duration={formatDuration(video.durationSeconds)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
};

export default UserHome;
