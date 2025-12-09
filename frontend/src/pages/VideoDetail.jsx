import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeftIcon, ClockIcon, CalendarIcon, UserIcon, Loader2Icon, AlertTriangleIcon } from 'lucide-react';
import videoService from '../services/video.service';
import { format, parseISO } from 'date-fns';
import './VideoDetail.css';

const VideoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const videoData = await videoService.getVideoById(id);
        setVideo(videoData);
      } catch (err) {
        setError(err.message || 'Error al cargar el video.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <main className="video-detail video-detail--loading">
        <Loader2Icon size={48} className="video-detail__loading-icon" />
        <p>Cargando resumen...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="video-detail video-detail--error">
        <AlertTriangleIcon size={48} className="video-detail__error-icon" />
        <h2>Error al cargar</h2>
        <p>{error}</p>
        <button onClick={handleGoBack} className="button button--secondary">
          Volver
        </button>
      </main>
    );
  }

  if (!video) {
    return (
      <main className="video-detail video-detail--no-data">
        <p>No se encontró el video.</p>
        <button onClick={handleGoBack} className="button button--secondary">
          Volver
        </button>
      </main>
    );
  }

  // TODO: El objeto video no trae el channelName. Se necesitará obtenerlo.
  const channelName = 'Canal Desconocido'; 
  const formattedDate = video.publishedAt ? format(parseISO(video.publishedAt), 'd MMM, yyyy') : 'Fecha desconocida';
  const durationInMinutes = video.durationSeconds ? Math.round(video.durationSeconds / 60) : 0;


  return (
    <main className="video-detail">
      <button onClick={handleGoBack} className="video-detail__back-link">
        <ArrowLeftIcon size={18} aria-hidden="true" />
        <span>Volver</span>
      </button>

      <article className="video-card-large" aria-labelledby="video-title">
        <div className="video-card-large__thumbnail-wrapper">
          <img 
            src={video.thumbnail || 'https://via.placeholder.com/400x225?text=No+Thumbnail'} 
            alt={video.title} 
            className="video-card-large__thumbnail-img" />
        </div>
        <div className="video-card-large__content">
          <header>
            <h1 id="video-title" className="video-card-large__title">{video.title}</h1>
            <ul className="video-card-large__meta" aria-label="Detalles del video">
              <li className="meta-item">
                <UserIcon size={16} aria-hidden="true" />
                {/* TODO: El objeto video no trae el channelName. Se necesitará obtenerlo */}
                <span>{channelName}</span>
              </li>
              <li className="meta-item">
                <ClockIcon size={16} aria-hidden="true" />
                <span>{durationInMinutes} min</span>
              </li>
              <li className="meta-item">
                <CalendarIcon size={16} aria-hidden="true" />
                <span>{formattedDate}</span>
              </li>
            </ul>
          </header>
          
          <div className="video-card-large__summary">
            <h2 className="video-card-large__summary-title">Resumen</h2>
            <div className="prose">
              <ReactMarkdown>{video.summary || 'No hay resumen disponible.'}</ReactMarkdown>
            </div>
          </div>
        </div>
      </article>

      <aside className="feedback-box" aria-labelledby="feedback-title">
        <h3 id="feedback-title" className="feedback-box__title">¿Te resultó útil este resumen?</h3>
        <p className="feedback-box__subtitle">Ayúdanos a mejorar calificando la calidad del resumen.</p>
        <div className="feedback-box__actions">
          <button className="button button--secondary">👍 Útil</button>
          <button className="button button--secondary">👎 No útil</button>
        </div>
      </aside>
    </main>
  );
};

export default VideoDetail;
