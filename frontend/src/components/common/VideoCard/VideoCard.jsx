import React from 'react';
import { Link } from 'react-router-dom';
import { PlayIcon } from 'lucide-react';
import './VideoCard.css';

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
