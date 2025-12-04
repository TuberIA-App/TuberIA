import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from '../components/SearchBar/SearchBar';
import ChannelItem from '../components/ChannelItem/ChannelItem';
import { UsersIcon, StarIcon, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import channelService from '../services/channel.service';
import './ChannelSearch.css';

const ChannelSearch = () => {
  const { isAuthenticated } = useAuth();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [followedChannels, setFollowedChannels] = useState([]);
  
  // Loading states
  const [searchLoading, setSearchLoading] = useState(false);
  const [followedLoading, setFollowedLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState({});
  
  // Error states
  const [searchError, setSearchError] = useState(null);
  const [followedError, setFollowedError] = useState(null);

  // Load followed channels on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadFollowedChannels();
    }
  }, [isAuthenticated]);

  // Load followed channels
  const loadFollowedChannels = async () => {
    try {
      setFollowedLoading(true);
      setFollowedError(null);
      const data = await channelService.getFollowedChannels();
      setFollowedChannels(data.channels);
    } catch (error) {
      console.error('Error loading followed channels:', error);
      setFollowedError(error.message);
    } finally {
      setFollowedLoading(false);
    }
  };

  // Search for a channel (debounced in SearchBar)
  const handleSearch = async (query) => {
    setSearchTerm(query);
    
    if (!query || query.trim().length < 2) {
      setSearchResult(null);
      setSearchError(null);
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError(null);
      const channel = await channelService.searchChannel(query);
      setSearchResult(channel);
    } catch (error) {
      console.error('Error searching channel:', error);
      setSearchError(error.message);
      setSearchResult(null);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle follow/unfollow toggle
  const handleFollowToggle = async (mongoId) => {
    if (!isAuthenticated) {
      setSearchError('Debes iniciar sesión para seguir canales');
      return;
    }

    const isCurrentlyFollowing = channelService.isFollowing(mongoId, followedChannels);

    try {
      setFollowLoading(prev => ({ ...prev, [mongoId]: true }));
      
      if (isCurrentlyFollowing) {
        // Unfollow using MongoDB _id
        await channelService.unfollowChannel(mongoId);
        setFollowedChannels(prev => prev.filter(ch => ch._id !== mongoId));
      } else {
        // Follow using MongoDB _id (backend already created channel during search)
        const updatedChannel = await channelService.followChannel(mongoId);
        setFollowedChannels(prev => [updatedChannel, ...prev]);
      }
      
      // Clear any previous errors
      setSearchError(null);
    } catch (error) {
      console.error('Error toggling follow:', error);
      setSearchError(error.message);
    } finally {
      setFollowLoading(prev => ({ ...prev, [mongoId]: false }));
    }
  };

  return (
    <main className="channel-search">
      <header className="channel-search__header">
        <div className="channel-search__title-group">
          <UsersIcon size={24} className="channel-search__title-icon" aria-hidden="true" />
          <h1 className="channel-search__title">Explorar Canales</h1>
        </div>
        <p className="channel-search__subtitle">
          Descubre y sigue canales de YouTube para recibir resúmenes de sus videos.
        </p>
        <SearchBar 
          placeholder="Buscar canal (@usuario o URL de YouTube)..." 
          onChange={handleSearch}
        />
      </header>

      {/* Search Error Message */}
      {searchError && (
        <div className="channel-search__error" role="alert">
          <AlertCircle size={20} />
          <span>{searchError}</span>
        </div>
      )}

      {/* Search Results Section */}
      <section className="channel-search__results" aria-labelledby="results-title">
        <h2 id="results-title" className="channel-search__section-title">
          {searchTerm ? 'Resultados de búsqueda' : 'Buscar canales de YouTube'}
        </h2>

        {searchLoading && (
          <div className="channel-search__loading">
            <Loader2 size={24} className="spinner" />
            <span>Buscando canal...</span>
          </div>
        )}

        {!searchLoading && searchResult && (
          <ul className="channel-search__list">
            <li>
              <ChannelItem
                id={searchResult._id}
                channelId={searchResult.channelId}
                name={searchResult.name}
                username={searchResult.username}
                description={searchResult.description}
                thumbnail={searchResult.thumbnail}
                followersCount={searchResult.followersCount}
                isFollowing={channelService.isFollowing(searchResult._id, followedChannels)}
                isLoading={followLoading[searchResult._id]}
                onFollowToggle={handleFollowToggle}
              />
            </li>
          </ul>
        )}

        {!searchLoading && !searchResult && searchTerm && !searchError && (
          <p className="channel-search__no-results">
            No se encontró ningún canal. Intenta con otro término de búsqueda.
          </p>
        )}

        {!searchTerm && !searchResult && (
          <p className="channel-search__instructions">
            Ingresa el nombre de usuario (ej: @vegetta777) o URL de un canal de YouTube para comenzar.
          </p>
        )}
      </section>

      {/* Followed Channels Section */}
      {isAuthenticated && (
        <section className="channel-search__followed" aria-labelledby="followed-title">
          <div className="channel-search__title-group">
            <StarIcon size={20} className="channel-search__title-icon" aria-hidden="true" />
            <h2 id="followed-title" className="channel-search__section-title">
              Canales seguidos {followedChannels.length > 0 && `(${followedChannels.length})`}
            </h2>
          </div>

          {followedError && (
            <div className="channel-search__error" role="alert">
              <AlertCircle size={20} />
              <span>{followedError}</span>
              <button onClick={loadFollowedChannels} className="retry-button">
                Reintentar
              </button>
            </div>
          )}

          {followedLoading && (
            <div className="channel-search__loading">
              <Loader2 size={24} className="spinner" />
              <span>Cargando canales seguidos...</span>
            </div>
          )}

          {!followedLoading && !followedError && followedChannels.length === 0 && (
            <p className="channel-search__no-results">
              No sigues ningún canal todavía. Busca y sigue canales para comenzar.
            </p>
          )}

          {!followedLoading && !followedError && followedChannels.length > 0 && (
            <ul className="channel-search__list" aria-labelledby="followed-title">
              {followedChannels.map(channel => (
                <li key={channel._id}>
                  <ChannelItem
                    id={channel._id}
                    channelId={channel.channelId}
                    name={channel.name}
                    username={channel.username}
                    description={channel.description}
                    thumbnail={channel.thumbnail}
                    followersCount={channel.followersCount}
                    subscribedAt={channel.subscribedAt}
                    isFollowing={true}
                    showVisitButton={true}
                    isLoading={followLoading[channel._id]}
                    onFollowToggle={handleFollowToggle}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
};

export default ChannelSearch;