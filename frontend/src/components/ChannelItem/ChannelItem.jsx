import React from 'react';
import { PlusIcon, CheckIcon, ExternalLinkIcon, Users, Loader2 } from 'lucide-react';
import './ChannelItem.css';
import Button from '../common/Button/Button';

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
  onFollowToggle 
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
    <div className="channel-item">
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
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="spinner" /> Procesando...
              </>
            ) : (
              <>
                <CheckIcon size={16} /> Siguiendo
              </>
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
