// src/hooks/useMyFeed.js
import { useState, useEffect, useCallback, useRef } from 'react';
import videoService from '../services/video.service';

/**
 * Custom hook para manejar el feed de videos con infinite scroll
 * @param {Object} options - Opciones de configuración
 * @param {string} options.status - Filtro de estado (completed|processing|failed|all)
 * @param {number} options.pageSize - Número de videos por página
 * @returns {Object} Estado y funciones del feed
 */
export const useMyFeed = ({ status = 'completed', pageSize = 10 } = {}) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Cache de páginas ya cargadas para evitar duplicados
  const loadedPagesRef = useRef(new Set());
  const loadingRef = useRef(false);
  const statusRef = useRef(status);

  // Reset cuando cambia el filtro
  useEffect(() => {
    if (statusRef.current !== status) {
      statusRef.current = status;
      setVideos([]);
      setCurrentPage(1);
      setHasMore(true);
      setError(null);
      loadedPagesRef.current.clear();
      loadingRef.current = false;
    }
  }, [status]);

  // Función para cargar videos
  const loadVideos = useCallback(async (page) => {
    // Prevenir carga duplicada
    if (loadingRef.current || loadedPagesRef.current.has(page)) {
      return;
    }

    try {
      loadingRef.current = true;
      
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);

      const data = await videoService.getMyVideos({
        page,
        limit: pageSize,
        status: status === 'all' ? undefined : status
      });

      // Marcar página como cargada
      loadedPagesRef.current.add(page);

      const newVideos = data.videos || [];
      
      setVideos(prev => {
        // Si es la primera página, reemplazar
        if (page === 1) {
          return newVideos;
        }
        
        // Evitar duplicados usando un Set con los IDs
        const existingIds = new Set(prev.map(v => v._id || v.id));
        const uniqueNewVideos = newVideos.filter(v => !existingIds.has(v._id || v.id));
        
        return [...prev, ...uniqueNewVideos];
      });

      // Actualizar hasMore basado en la paginación
      const pagination = data.pagination;
      if (pagination) {
        setHasMore(pagination.currentPage < pagination.totalPages);
      } else {
        // Si no hay paginación o no hay videos, no hay más
        setHasMore(newVideos.length === pageSize);
      }

    } catch (err) {
      console.error('Error loading videos:', err);
      setError(err.message || 'Error al cargar videos');
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [status, pageSize]);

  // Cargar primera página
  useEffect(() => {
    loadVideos(1);
  }, [loadVideos]);

  // Función para cargar más (siguiente página)
  const loadMore = useCallback(() => {
    if (!loadingRef.current && hasMore && !loading && !loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadVideos(nextPage);
    }
  }, [currentPage, hasMore, loading, loadingMore, loadVideos]);

  // Función para recargar el feed
  const reload = useCallback(() => {
    setVideos([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    loadedPagesRef.current.clear();
    loadingRef.current = false;
    loadVideos(1);
  }, [loadVideos]);

  return {
    videos,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    reload
  };
};

export default useMyFeed;
