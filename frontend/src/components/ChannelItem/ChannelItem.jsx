/**
 * @fileoverview Channel item component for displaying YouTube channel info.
 * @module components/ChannelItem
 */

import React from 'react';
import { PlusIcon, CheckIcon, ExternalLinkIcon, Users, Loader2 } from 'lucide-react';
import './ChannelItem.css';
import Button from '../common/Button/Button';

/**
 * Channel item component displaying channel info with follow/unfollow actions.
 * Used in channel search results and followed channels lists.
 * @component
 * @param {Object} props - Component props
 * @param {string} props.id - MongoDB ObjectId of the channel
 * @param {string} [props.channelId] - YouTube channel ID (UCxxxxxx format)
 * @param {string} props.name - Channel display name
 * @param {string} [props.username] - Channel username/handle
 * @param {string} [props.description] - Channel description
 * @param {string} [props.thumbnail] - Channel avatar URL
 * @param {number} [props.followersCount] - Number of followers in TuberIA
 * @param {string} [props.subscribedAt] - Date user followed the channel
 * @param {boolean} [props.isFollowing] - Whether current user follows channel
 * @param {boolean} [props.showVisitButton] - Whether to show YouTube link button
 * @param {boolean} [props.isLoading] - Whether follow action is in progress
 * @param {function} [props.onFollowToggle] - Handler for follow/unfollow action
 * @param {function} [props.onChannelClick] - Handler for channel card click
 * @returns {JSX.Element} Channel item card
 */
const ChannelItem = ({
  id,
  channelId,
  name,
  username,
  description,
  thumbnail,
  followersCount,
  subscribedAt,
  isFollowing,
  showVisitButton,
  isLoading,
  onFollowToggle,
  onChannelClick,
}) => {
  const handleFollowToggle = () => {
    if (!isLoading && id) {
      // Pass MongoDB _id (from backend search or followed channels)
      onFollowToggle(id);
    }
  };

  const handleVisitChannel = () => {
    if (channelId) {
      window.open(`https://www.youtube.com/channel/${channelId}`, '_blank');
    } else if (username) {
      window.open(`https://www.youtube.com/${username}`, '_blank');
    }
  };

  // Use thumbnail or fallback to YouTube default
  const channelAvatar = thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ef4444&color=fff&size=200`;

  return (
      <div
        className="channel-item"
        onClick={onChannelClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onChannelClick) {
            onChannelClick();
          }
        }}
      >
      <img 
        src={channelAvatar} 
        alt={`${name} avatar`} 
        className="channel-item__avatar" 
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ef4444&color=fff&size=200`;
        }}
      />
      <div className="channel-item__info">
        <h3 className="channel-item__name">{name}</h3>
        {username && (
          <p className="channel-item__username">{username}</p>
        )}
        {description && (
          <p className="channel-item__description">{description}</p>
        )}
        {followersCount !== undefined && (
          <div className="channel-item__meta">
            <Users size={14} />
            <span>{followersCount} {followersCount === 1 ? 'seguidor' : 'seguidores'} en TuberIA</span>
          </div>
        )}
        {subscribedAt && (
          <p className="channel-item__subscribed">
            Siguiendo desde {new Date(subscribedAt).toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
        )}
      </div>
      <div className="channel-item__actions">
        {isFollowing ? (
          <Button 
            variant="secondary" 
            onClick={handleFollowToggle} 
            disabled={isLoading}
            aria-label={`Dejar de seguir ${name}`}
            className="btn-following"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="spinner" /> Procesando...
              </>
            ) : (
              <span className="btn-following-content">
                <CheckIcon size={16} /> Siguiendo
              </span>
            )}
          </Button>
        ) : (
          <Button 
            variant="primary" 
            onClick={handleFollowToggle} 
            disabled={isLoading}
            aria-label={`Seguir ${name}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="spinner" /> Siguiendo...
              </>
            ) : (
              <>
                <PlusIcon size={16} /> Seguir
              </>
            )}
          </Button>
        )}
        {showVisitButton && (
          <Button 
            variant="tertiary" 
            onClick={handleVisitChannel}
            aria-label={`Visitar canal de ${name} en YouTube`}
          >
            <ExternalLinkIcon size={16} /> Visitar
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChannelItem;
