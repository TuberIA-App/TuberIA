import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VideoCard from '../components/common/VideoCard/VideoCard';
import { SparklesIcon, TrendingUpIcon, ClockIcon, BookmarkIcon, Loader2Icon, AlertCircleIcon } from 'lucide-react';
import channelService from '../services/channel.service';
import videoService from '../services/video.service';
import './UserHome.css';

const UserHome = () => {
  const [recentVideos, setRecentVideos] = useState([]);
  const [channelsCount, setChannelsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calcular estadísticas basadas en videos reales
  const totalVideos = recentVideos.length;
  const totalTimeMinutes = recentVideos.reduce((acc, video) => {
    if (video.duration) {
      // Convertir duración MM:SS o HH:MM:SS a minutos
      const parts = video.duration.split(':').map(Number);
      if (parts.length === 2) {
        return acc + parts[0] + (parts[1] / 60);
      } else if (parts.length === 3) {
        return acc + (parts[0] * 60) + parts[1] + (parts[2] / 60);
      }
    }
    return acc;
  }, 0);
  
  // Estimar tiempo ahorrado (80% del tiempo total del video)
  const timeSavedMinutes = totalTimeMinutes * 0.8;
  const timeSavedHours = (timeSavedMinutes / 60).toFixed(1);

  const stats = [
    { label: 'Resúmenes leídos', value: totalVideos.toString(), icon: BookmarkIcon },
    { label: 'Tiempo ahorrado', value: `${timeSavedHours}h`, icon: ClockIcon },
    { label: 'Canales seguidos', value: channelsCount.toString(), icon: TrendingUpIcon }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener videos recientes y canales seguidos en paralelo
        const [videosData, channelsData] = await Promise.all([
          videoService.getMyVideos({ limit: 10, status: 'completed' }),
          channelService.getFollowedChannels()
        ]);

        setRecentVideos(videosData.videos || []);
        setChannelsCount(channelsData.count || 0);
      } catch (err) {
        console.error('Error loading user home data:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        {recentVideos.length === 0 ? (
          <div className="video-section__empty">
            <p>No hay resúmenes disponibles todavía.</p>
            <p>Los videos se procesarán automáticamente cuando tus canales publiquen nuevo contenido.</p>
          </div>
        ) : (
          <ul className="video-section__grid">
            {recentVideos.slice(0, 6).map(video => (
              <li key={video._id || video.id}>
                <VideoCard
                  id={video._id || video.id}
                  title={video.title || 'Video sin título'}
                  channelName={video.channel?.name || 'Canal desconocido'}
                  thumbnail={video.thumbnail || 'https://via.placeholder.com/400x225?text=No+Thumbnail'}
                  duration={video.duration || '00:00'}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default UserHome;
