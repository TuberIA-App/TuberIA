import React from 'react';
import { PlusIcon, CheckIcon } from 'lucide-react';
import './ChannelItem.css';
import Button from '../common/Button/Button'; // Assuming Button component exists

const ChannelItem = ({ id, name, description, avatar, isFollowing, showVisitButton, onFollowToggle }) => {
  // Placeholder for follow/unfollow logic
  const handleFollowToggle = () => {
    onFollowToggle(id);
    // In a real application, this would dispatch an action to update backend/state
  };

  return (
    <div className="channel-item">
      <img src={avatar} alt={`${name} avatar`} className="channel-item__avatar" />
      <div className="channel-item__info">
        <h3 className="channel-item__name">{name}</h3>
        <p className="channel-item__description">{description}</p>
      </div>
      <div className="channel-item__actions">
        {isFollowing ? (
          <Button variant="secondary" onClick={handleFollowToggle} aria-label={`Unfollow ${name}`}>
            <CheckIcon size={16} /> Siguiendo
          </Button>
        ) : (
          <Button variant="primary" onClick={handleFollowToggle} aria-label={`Follow ${name}`}>
            <PlusIcon size={16} /> Seguir
          </Button>
        )}
        {showVisitButton && (
          <Button variant="tertiary" onClick={() => console.log(`Visit channel ${name}`)}>
            Visitar
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChannelItem;
