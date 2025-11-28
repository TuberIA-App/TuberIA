import React from 'react';
import VideoCard from '../components/common/VideoCard/VideoCard';
import { TrendingUpIcon } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  // Datos de ejemplo
  const channels = [
    {
      id: '1',
      name: 'Tech Insights',
      videos: [
        { id: '101', title: 'Cómo la IA está transformando el desarrollo de software', thumbnail: 'https://i.pravatar.cc/400?u=101', duration: '15:42' },
        { id: '102', title: 'El futuro de la computación cuántica', thumbnail: 'https://i.pravatar.cc/400?u=102', duration: '20:15' },
      ]
    },
    {
      id: '2',
      name: 'Dev Academy',
      videos: [
        { id: '201', title: 'Guía completa de React Hooks en 2024', thumbnail: 'https://i.pravatar.cc/400?u=201', duration: '22:18' },
        { id: '202', title: 'TypeScript avanzado: Tips y trucos', thumbnail: 'https://i.pravatar.cc/400?u=202', duration: '18:45' },
      ]
    }
  ];

  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__title-group">
          <TrendingUpIcon size={24} className="dashboard__title-icon" aria-hidden="true" />
          <h1 className="dashboard__title">Mis Canales</h1>
        </div>
        <p className="dashboard__subtitle">
          Resúmenes de los canales que sigues.
        </p>
      </header>

      <div className="dashboard__main">
        {channels.map(channel => (
          <section key={channel.id} className="channel-section" aria-labelledby={`channel-title-${channel.id}`}>
            <header className="channel-section__header">
              <h2 id={`channel-title-${channel.id}`} className="channel-section__title">
                {channel.name}
              </h2>
              <button className="channel-section__view-all-button">
                Ver todos
              </button>
            </header>
            <ul className="channel-section__videos-grid" aria-labelledby={`channel-title-${channel.id}`}>
              {channel.videos.map(video => (
                <li key={video.id}>
                  <VideoCard
                    id={video.id}
                    title={video.title}
                    channelName={channel.name}
                    thumbnail={video.thumbnail}
                    duration={video.duration}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
};

export default Dashboard;
