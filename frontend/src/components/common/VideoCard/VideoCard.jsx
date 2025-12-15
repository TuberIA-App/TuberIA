/**
 * @fileoverview Video card component for displaying video previews.
 * @module components/common/VideoCard
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { PlayIcon } from 'lucide-react';
import './VideoCard.css';

/**
 * Video card component displaying video thumbnail and metadata.
 * Links to video detail page.
 * @component
 * @param {Object} props - Component props
 * @param {string} props.id - Video ID for navigation
 * @param {string} props.title - Video title
 * @param {string} props.channelName - Channel name
 * @param {string} props.thumbnail - Thumbnail image URL
 * @param {string} [props.duration='12:34'] - Formatted video duration
 * @returns {JSX.Element} Video card article element
 */
const VideoCard = ({
  id,
  title,
  channelName,
  thumbnail,
  duration = '12:34'
}) => {
  return (
    <article className="video-card" aria-labelledby={`video-title-${id}`}>
      <Link to={`/video/${id}`} className="video-card__link">
        <div className="video-card__thumbnail-wrapper">
          <img src={thumbnail} alt={title} fetchPriority='high' className="video-card__thumbnail-img" />
          <div className="video-card__thumbnail-overlay" aria-hidden="true">
            <div className="video-card__play-icon-wrapper">
              <PlayIcon size={20} className="video-card__play-icon" />
            </div>
          </div>
          <div className="video-card__duration-badge" aria-hidden="true">
            {duration}
          </div>
        </div>
      </Link>
      <div className="video-card__info">
        <h3 id={`video-title-${id}`} className="video-card__title">
          <Link to={`/video/${id}`}>{title}</Link>
        </h3>
        <p className="video-card__channel-name">{channelName}</p>
        <Link to={`/video/${id}`} className="video-card__summary-link">
          Ver resumen
        </Link>
      </div>
    </article>
  );
};

export default VideoCard;
