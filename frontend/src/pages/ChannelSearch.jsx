import React, { useState } from 'react';
import SearchBar from '../components/SearchBar/SearchBar';
import ChannelItem from '../components/ChannelItem/ChannelItem';
import { UsersIcon, StarIcon } from 'lucide-react';
import './ChannelSearch.css';

const ChannelSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Datos de ejemplo
  const [channels, setChannels] = useState([
    { id: '1', name: 'Tech Insights', description: 'Análisis profundo de tecnología y desarrollo', avatar: 'https://i.pravatar.cc/100?u=1', isFollowing: false },
    { id: '2', name: 'Dev Academy', description: 'Tutoriales de programación y desarrollo web', avatar: 'https://i.pravatar.cc/100?u=2', isFollowing: true },
    { id: '3', name: 'AI Learning', description: 'Machine Learning y ciencia de datos', avatar: 'https://i.pravatar.cc/100?u=3', isFollowing: false },
    { id: '4', name: 'Design Pro', description: 'Diseño UI/UX y desarrollo frontend', avatar: 'https://i.pravatar.cc/100?u=4', isFollowing: true }
  ]);

  const handleFollowToggle = (channelId) => {
    setChannels(prevChannels =>
      prevChannels.map(channel =>
        channel.id === channelId
          ? { ...channel, isFollowing: !channel.isFollowing }
          : channel
      )
    );
  };

  const followedChannels = channels.filter(channel => channel.isFollowing);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredChannels = searchTerm
    ? channels.filter(channel =>
        channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        channel.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : channels;

  return (
    <main className="channel-search">
      <header className="channel-search__header">
        <div className="channel-search__title-group">
          <UsersIcon size={24} className="channel-search__title-icon" aria-hidden="true" />
          <h1 className="channel-search__title">Explorar Canales</h1>
        </div>
        <p className="channel-search__subtitle">
          Descubre y sigue canales para recibir resúmenes de sus videos.
        </p>
        <SearchBar placeholder="Buscar por nombre o tema..." onChange={handleSearch} />
      </header>

      <section className="channel-search__results" aria-labelledby="results-title">
        <h2 id="results-title" className="channel-search__section-title">
          {searchTerm ? 'Resultados de búsqueda' : 'Todos los canales'}
        </h2>
        <ul className="channel-search__list">
          {filteredChannels.map(channel => (
            <li key={channel.id}>
              <ChannelItem
                id={channel.id}
                name={channel.name}
                description={channel.description}
                avatar={channel.avatar}
                isFollowing={channel.isFollowing}
                onFollowToggle={handleFollowToggle}
              />
            </li>
          ))}
        </ul>
      </section>

      {followedChannels.length > 0 && (
        <section className="channel-search__followed" aria-labelledby="followed-title">
          <div className="channel-search__title-group">
            <StarIcon size={20} className="channel-search__title-icon" aria-hidden="true" />
            <h2 id="followed-title" className="channel-search__section-title">
              Canales seguidos
            </h2>
          </div>
          <ul className="channel-search__list" aria-labelledby="followed-title">
            {followedChannels.map(channel => (
              <li key={channel.id}>
                <ChannelItem
                  id={channel.id}
                  name={channel.name}
                  description={channel.description}
                  avatar={channel.avatar}
                  isFollowing={true}
                  showVisitButton={true}
                  onFollowToggle={handleFollowToggle}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
};

export default ChannelSearch;