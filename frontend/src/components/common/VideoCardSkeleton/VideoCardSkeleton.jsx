// src/components/common/VideoCardSkeleton/VideoCardSkeleton.jsx
import React from 'react';
import './VideoCardSkeleton.css';

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
