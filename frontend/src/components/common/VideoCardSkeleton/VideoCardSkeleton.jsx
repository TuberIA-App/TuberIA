/**
 * @fileoverview Video card skeleton component for loading states.
 * @module components/common/VideoCardSkeleton
 */

import React from 'react';
import './VideoCardSkeleton.css';

/**
 * Skeleton placeholder component for video cards.
 * Displays animated loading placeholder matching VideoCard layout.
 * @component
 * @returns {JSX.Element} Skeleton loading placeholder
 */
const VideoCardSkeleton = () => {
  return (
    <div className="video-card-skeleton">
      <div className="video-card-skeleton__thumbnail"></div>
      <div className="video-card-skeleton__content">
        <div className="video-card-skeleton__title"></div>
        <div className="video-card-skeleton__title video-card-skeleton__title--short"></div>
        <div className="video-card-skeleton__meta"></div>
      </div>
    </div>
  );
};

export default VideoCardSkeleton;
