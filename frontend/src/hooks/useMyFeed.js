/**
 * @fileoverview Custom hook for managing video feed with infinite scroll.
 * Handles pagination, loading states, and duplicate prevention.
 * @module hooks/useMyFeed
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Sentry from '@sentry/react';
import videoService from '../services/video.service';

/**
 * @typedef {Object} Video
 * @property {string} _id - Video MongoDB ID
 * @property {string} videoId - YouTube video ID
 * @property {string} title - Video title
 * @property {string} [thumbnail] - Thumbnail URL
 * @property {string} status - Processing status
 * @property {string} [summary] - AI-generated summary
 * @property {string[]} [keyPoints] - AI-generated key points
 */

/**
 * @typedef {Object} UseMyFeedReturn
 * @property {Video[]} videos - Array of loaded videos
 * @property {boolean} loading - Whether initial load is in progress
 * @property {boolean} loadingMore - Whether loading more videos
 * @property {string|null} error - Error message if any
 * @property {boolean} hasMore - Whether more videos are available
 * @property {function(): void} loadMore - Function to load next page
 * @property {function(): void} reload - Function to reload feed from start
 */

/**
 * Custom hook for managing video feed with infinite scroll functionality.
 * Handles pagination, prevents duplicate loading, and manages loading states.
 * @param {Object} [options={}] - Configuration options
 * @param {string} [options.status='completed'] - Filter by status (completed|processing|failed|all)
 * @param {number} [options.pageSize=10] - Number of videos per page
 * @returns {UseMyFeedReturn} Feed state and control functions
 * @example
 * const { videos, loading, hasMore, loadMore } = useMyFeed({
 *   status: 'completed',
 *   pageSize: 20
 * });
 */
export const useMyFeed = ({ status = 'completed', pageSize = 10 } = {}) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  /**
   * Cache of already loaded page numbers to prevent duplicate requests.
   * @type {React.MutableRefObject<Set<number>>}
   * @private
   */
  const loadedPagesRef = useRef(new Set());

  /**
   * Ref to track loading state without causing re-renders.
   * @type {React.MutableRefObject<boolean>}
   * @private
   */
  const loadingRef = useRef(false);

  /**
   * Ref to track current status filter value.
   * @type {React.MutableRefObject<string>}
   * @private
   */
  const statusRef = useRef(status);

  /**
   * Effect: Reset state when status filter changes.
   */
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

  /**
   * Loads videos for a specific page.
   * Prevents duplicate loading and handles pagination.
   * @param {number} page - Page number to load
   * @private
   */
  const loadVideos = useCallback(async (page) => {
    // Prevent duplicate loading
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

      // Mark page as loaded
      loadedPagesRef.current.add(page);

      const newVideos = data.videos || [];
      
      setVideos(prev => {
        // If first page, replace all
        if (page === 1) {
          return newVideos;
        }

        // Prevent duplicates using Set with IDs
        const existingIds = new Set(prev.map(v => v._id || v.id));
        const uniqueNewVideos = newVideos.filter(v => !existingIds.has(v._id || v.id));
        
        return [...prev, ...uniqueNewVideos];
      });

      // Update hasMore based on pagination
      const pagination = data.pagination;
      if (pagination) {
        setHasMore(pagination.currentPage < pagination.totalPages);
      } else {
        // If no pagination or no videos, no more available
        setHasMore(newVideos.length === pageSize);
      }

    } catch (err) {
      Sentry.captureException(err, { extra: { context: 'loadVideos', page } });
      setError(err.message || 'Error al cargar videos');
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [status, pageSize]);

  /**
   * Effect: Load first page on mount or when loadVideos changes.
   */
  useEffect(() => {
    loadVideos(1);
  }, [loadVideos]);

  /**
   * Loads the next page of videos.
   * Only triggers if not already loading and more videos exist.
   */
  const loadMore = useCallback(() => {
    if (!loadingRef.current && hasMore && !loading && !loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadVideos(nextPage);
    }
  }, [currentPage, hasMore, loading, loadingMore, loadVideos]);

  /**
   * Reloads the entire feed from the first page.
   * Clears all cached data and resets state.
   */
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
