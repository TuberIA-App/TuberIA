import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUpIcon, Loader2Icon, AlertCircleIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { useUserData } from '../context/UserDataContext';
import VideoCard from '../components/common/VideoCard/VideoCard';
import userService from '../services/user.service';
import channelService from '../services/channel.service';
import videoService from '../services/video.service';
import './Dashboard.css';

const Dashboard = () => {
  const { decrementChannelsCount } = useUserData();
  const [channelsWithVideos, setChannelsWithVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unfollowingChannelId, setUnfollowingChannelId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [channelToUnfollow, setChannelToUnfollow] = useState(null);

  // Helper to format duration from seconds to MM:SS
  const formatDuration = (totalSeconds) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
      return '00:00';
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const fetchChannelsAndVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener canales y videos en paralelo
      const [channelsData, videosData] = await Promise.all([
        userService.getMyChannels(),
        videoService.getMyVideos({ limit: 100, status: 'completed' })
      ]);

      const channels = channelsData.channels || [];
      const allVideos = videosData.videos || [];

      // Agrupar videos por canal
      const channelsWithVideosData = channels.map(channel => {
        const channelVideos = allVideos.filter(video => video.channelId === channel.id);

        return {
          ...channel,
          videos: channelVideos.slice(0, 4) // Mostrar max 4 videos por canal
        };
      });

      setChannelsWithVideos(channelsWithVideosData);
    } catch (err) {
      console.error('Error loading channels and videos:', err);
      setError(err.message || 'Error al cargar tus canales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannelsAndVideos();
  }, []);

  const handleUnfollowClick = (channel) => {
    setChannelToUnfollow(channel);
    setShowConfirmDialog(true);
  };

  const handleConfirmUnfollow = async () => {
    if (!channelToUnfollow) return;

    try {
      setUnfollowingChannelId(channelToUnfollow.id);
      setShowConfirmDialog(false);

      // Optimistic update - remove immediately
      setChannelsWithVideos(prev => prev.filter(c => c.id !== channelToUnfollow.id));

      // Call API
      await channelService.unfollowChannel(channelToUnfollow.id);
      
      // Update global counter
      decrementChannelsCount();
    } catch (err) {
      console.error('Error unfollowing channel:', err);
      
      // Revert on error
      await fetchChannelsAndVideos();
      
      alert(err.message || 'Error al dejar de seguir el canal');
    } finally {
      setUnfollowingChannelId(null);
      setChannelToUnfollow(null);
    }
  };

  const handleCancelUnfollow = () => {
    setShowConfirmDialog(false);
    setChannelToUnfollow(null);
  };

  if (loading) {
    return (
      <main className="dashboard">
        <div className="dashboard__loading">
          <Loader2Icon size={48} className="dashboard__loading-icon" aria-hidden="true" />
          <p>Cargando tus canales...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard">
        <div className="dashboard__error">
          <AlertCircleIcon size={48} className="dashboard__error-icon" aria-hidden="true" />
          <h2>Error al cargar tus canales</h2>
          <p>{error}</p>
          <button 
            className="dashboard__retry-button"
            onClick={fetchChannels}
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  if (channelsWithVideos.length === 0) {
    return (
      <main className="dashboard">
        <header className="dashboard__header">
          <div className="dashboard__title-group">
            <TrendingUpIcon size={28} className="dashboard__title-icon" aria-hidden="true" />
            <h1 className="dashboard__title">Mis Canales</h1>
          </div>
          <p className="dashboard__subtitle">
            Resúmenes de los canales que sigues.
          </p>
        </header>

        <div className="dashboard__empty">
          <SearchIcon size={64} className="dashboard__empty-icon" aria-hidden="true" />
          <h2>No sigues ningún canal todavía</h2>
          <p>Comienza a seguir canales para recibir resúmenes automáticos de sus videos.</p>
          <Link to="/channels" className="button button--primary button--large">
            <SearchIcon size={20} aria-hidden="true" />
            Descubrir canales
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__title-group">
          <TrendingUpIcon size={28} className="dashboard__title-icon" aria-hidden="true" />
          <h1 className="dashboard__title">Mis Canales</h1>
        </div>
        <p className="dashboard__subtitle">
          Resúmenes de los canales que sigues.
        </p>
      </header>

      <div className="dashboard__main">
        {channelsWithVideos.map(channel => (
          <section key={channel.id} className="channel-section" aria-labelledby={`channel-title-${channel.id}`}>
            <header className="channel-section__header">
              <div className="channel-section__title-group">
                <h2 id={`channel-title-${channel.id}`} className="channel-section__title">
                  {channel.name}
                </h2>
                {channel.videos.length > 0 && (
                  <span className="channel-section__video-count">
                    {channel.videos.length} videos
                  </span>
                )}
              </div>
              <button 
                className="channel-section__unfollow-button"
                onClick={() => handleUnfollowClick(channel)}
                disabled={unfollowingChannelId === channel.id}
              >
                {unfollowingChannelId === channel.id ? (
                  <>
                    <Loader2Icon size={14} className="spinner" aria-hidden="true" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Trash2Icon size={14} aria-hidden="true" />
                    Dejar de seguir
                  </>
                )}
              </button>
            </header>

            {channel.videos.length === 0 ? (
              <div className="channel-section__empty">
                <p>Este canal aún no tiene resúmenes disponibles.</p>
                <p>Los videos se procesarán automáticamente cuando el canal publique nuevo contenido.</p>
              </div>
            ) : (
              <ul className="channel-section__videos-grid" aria-labelledby={`channel-title-${channel.id}`}>
                {channel.videos.map(video => (
                  <li key={video._id || video.id}>
                    <VideoCard
                      id={video.videoId}
                      title={video.title || 'Video sin título'}
                      channelName={channel.name}
                      thumbnail={video.thumbnail || 'https://via.placeholder.com/400x225?text=No+Thumbnail'}
                      duration={formatDuration(video.durationSeconds)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && channelToUnfollow && (
        <div className="modal-overlay" onClick={handleCancelUnfollow}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-dialog__title">¿Dejar de seguir canal?</h3>
            <p className="modal-dialog__message">
              ¿Estás seguro de que quieres dejar de seguir a <strong>{channelToUnfollow.name}</strong>? 
              Ya no recibirás resúmenes de sus videos.
            </p>
            <div className="modal-dialog__actions">
              <button 
                className="button button--secondary"
                onClick={handleCancelUnfollow}
              >
                Cancelar
              </button>
              <button 
                className="button button--primary"
                onClick={handleConfirmUnfollow}
              >
                <Trash2Icon size={16} aria-hidden="true" />
                Dejar de seguir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
