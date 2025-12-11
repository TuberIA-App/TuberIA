// src/pages/MyFeedPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon, Loader2Icon, AlertCircleIcon, FilterIcon, SearchIcon } from 'lucide-react';
import VideoCard from '../components/common/VideoCard/VideoCard';
import VideoCardSkeleton from '../components/common/VideoCardSkeleton/VideoCardSkeleton';
import useMyFeed from '../hooks/useMyFeed';
import './MyFeedPage.css';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'completed', label: 'Completados' },
  { value: 'processing', label: 'Procesando' },
  { value: 'failed', label: 'Fallidos' }
];

const MyFeedPage = () => {
  const [statusFilter, setStatusFilter] = useState('completed');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const { videos, loading, loadingMore, error, hasMore, loadMore, reload } = useMyFeed({
    status: statusFilter,
    pageSize: 10
  });

  // Ref para el elemento observador (infinite scroll)
  const observerRef = useRef(null);
  const loadMoreTriggerRef = useRef(null);

  // Configurar IntersectionObserver para infinite scroll
  useEffect(() => {
    // Limpiar observer anterior
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Crear nuevo observer
    const options = {
      root: null,
      rootMargin: '100px', // Comenzar a cargar 100px antes de llegar al final
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
        loadMore();
      }
    }, options);

    // Observar el elemento trigger
    const currentTrigger = loadMoreTriggerRef.current;
    if (currentTrigger) {
      observerRef.current.observe(currentTrigger);
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loading, loadMore]);

  // Manejar cambio de filtro
  const handleFilterChange = useCallback((newStatus) => {
    setStatusFilter(newStatus);
    setShowFilterMenu(false);
  }, []);

  // Cerrar menú de filtros al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterMenu && !event.target.closest('.filter-dropdown')) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterMenu]);

  // Estado de carga inicial
  if (loading && videos.length === 0) {
    return (
      <main className="my-feed-page">
        <header className="my-feed-page__header">
          <div className="my-feed-page__title-group">
            <SparklesIcon size={28} className="my-feed-page__icon" aria-hidden="true" />
            <h1 className="my-feed-page__title">Mi Feed</h1>
          </div>
        </header>

        <div className="my-feed-page__grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <VideoCardSkeleton key={index} />
          ))}
        </div>
      </main>
    );
  }

  // Estado de error
  if (error && videos.length === 0) {
    return (
      <main className="my-feed-page">
        <div className="my-feed-page__error">
          <AlertCircleIcon size={48} className="my-feed-page__error-icon" aria-hidden="true" />
          <h2>Error al cargar el feed</h2>
          <p>{error}</p>
          <button 
            className="my-feed-page__retry-button"
            onClick={reload}
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  // Empty state - no sigue ningún canal
  if (!loading && videos.length === 0 && statusFilter === 'all') {
    return (
      <main className="my-feed-page">
        <div className="my-feed-page__empty">
          <SearchIcon size={64} className="my-feed-page__empty-icon" aria-hidden="true" />
          <h2>No sigues ningún canal todavía</h2>
          <p>Comienza a seguir canales de YouTube para ver sus videos resumidos aquí.</p>
          <Link to="/channels" className="my-feed-page__cta-button">
            <SearchIcon size={20} aria-hidden="true" />
            Descubrir canales
          </Link>
        </div>
      </main>
    );
  }

  // Empty state - no hay videos con el filtro actual
  if (!loading && videos.length === 0) {
    return (
      <main className="my-feed-page">
        <header className="my-feed-page__header">
          <div className="my-feed-page__title-group">
            <SparklesIcon size={28} className="my-feed-page__icon" aria-hidden="true" />
            <h1 className="my-feed-page__title">Mi Feed</h1>
          </div>

          {/* Filtro de estado */}
          <div className="filter-dropdown">
            <button 
              className="filter-dropdown__button"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              aria-label="Filtrar por estado"
            >
              <FilterIcon size={18} aria-hidden="true" />
              {STATUS_OPTIONS.find(opt => opt.value === statusFilter)?.label}
            </button>
            
            {showFilterMenu && (
              <ul className="filter-dropdown__menu" role="menu">
                {STATUS_OPTIONS.map(option => (
                  <li key={option.value}>
                    <button
                      className={`filter-dropdown__item ${statusFilter === option.value ? 'filter-dropdown__item--active' : ''}`}
                      onClick={() => handleFilterChange(option.value)}
                      role="menuitem"
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </header>

        <div className="my-feed-page__empty-filtered">
          <p>No hay videos {STATUS_OPTIONS.find(opt => opt.value === statusFilter)?.label.toLowerCase()} en este momento.</p>
          <button 
            className="my-feed-page__filter-reset"
            onClick={() => handleFilterChange('all')}
          >
            Ver todos los videos
          </button>
        </div>
      </main>
    );
  }

  // Vista normal con videos
  return (
    <main className="my-feed-page">
      <header className="my-feed-page__header">
        <div className="my-feed-page__title-group">
          <SparklesIcon size={28} className="my-feed-page__icon" aria-hidden="true" />
          <div>
            <h1 className="my-feed-page__title">Mi Feed</h1>
            <p className="my-feed-page__subtitle">{videos.length} videos disponibles</p>
          </div>
        </div>

        {/* Filtro de estado */}
        <div className="filter-dropdown">
          <button 
            className="filter-dropdown__button"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            aria-label="Filtrar por estado"
          >
            <FilterIcon size={18} aria-hidden="true" />
            {STATUS_OPTIONS.find(opt => opt.value === statusFilter)?.label}
          </button>
          
          {showFilterMenu && (
            <ul className="filter-dropdown__menu" role="menu">
              {STATUS_OPTIONS.map(option => (
                <li key={option.value}>
                  <button
                    className={`filter-dropdown__item ${statusFilter === option.value ? 'filter-dropdown__item--active' : ''}`}
                    onClick={() => handleFilterChange(option.value)}
                    role="menuitem"
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      {/* Grid de videos */}
      <div className="my-feed-page__grid">
        {videos.map(video => (
          <VideoCard
            key={video._id || video.id}
            id={video.videoId}
            title={video.title || 'Video sin título'}
            channelName={video.channel?.name || 'Canal desconocido'}
            thumbnail={video.thumbnail || 'https://via.placeholder.com/400x225?text=No+Thumbnail'}
            duration={video.duration || '00:00'}
          />
        ))}

        {/* Skeletons mientras carga más */}
        {loadingMore && (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <VideoCardSkeleton key={`skeleton-${index}`} />
            ))}
          </>
        )}
      </div>

      {/* Elemento para activar infinite scroll */}
      {hasMore && !loadingMore && (
        <div 
          ref={loadMoreTriggerRef} 
          className="my-feed-page__load-trigger"
          aria-hidden="true"
        />
      )}

      {/* Mensaje de fin de contenido */}
      {!hasMore && videos.length > 0 && (
        <div className="my-feed-page__end-message">
          <p>Has visto todos los videos disponibles</p>
        </div>
      )}

      {/* Error al cargar más */}
      {error && videos.length > 0 && (
        <div className="my-feed-page__error-inline">
          <AlertCircleIcon size={20} aria-hidden="true" />
          <span>Error al cargar más videos</span>
          <button onClick={reload}>Reintentar</button>
        </div>
      )}
    </main>
  );
};

export default MyFeedPage;
