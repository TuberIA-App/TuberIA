import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeftIcon, ClockIcon, CalendarIcon, UserIcon } from 'lucide-react';
import './VideoDetail.css';

const VideoDetail = () => {
  const { id } = useParams();

  // Datos de ejemplo
  const video = {
    id,
    title: 'Cómo la IA está transformando el desarrollo de software',
    channelName: 'Tech Insights',
    thumbnail: 'https://i.pravatar.cc/600?u=101',
    duration: '15:42',
    publishedDate: '15 de marzo, 2024',
    summary: `La inteligencia artificial está revolucionando la forma en que desarrollamos software. En este video, exploramos las principales herramientas y técnicas que están cambiando el panorama del desarrollo.

**Puntos clave:**
- **Asistentes de código con IA**: Herramientas como GitHub Copilot y ChatGPT están ayudando a los desarrolladores a escribir código más rápido y con menos errores.
- **Automatización de pruebas**: Los sistemas de IA pueden generar casos de prueba automáticamente, identificando escenarios que los humanos podrían pasar por alto.
- **Detección de bugs**: Los algoritmos de machine learning pueden analizar código para encontrar vulnerabilidades y errores potenciales antes de que lleguen a producción.
- **Optimización de rendimiento**: La IA puede sugerir mejoras en el código para hacerlo más eficiente y escalable.

**Conclusión:**
La IA no está reemplazando a los desarrolladores, sino potenciando sus capacidades. Las herramientas de IA permiten a los equipos enfocarse en problemas más complejos y creativos, mientras automatizan tareas repetitivas.`
  };

  return (
    <main className="video-detail">
      <Link to="/dashboard" className="video-detail__back-link">
        <ArrowLeftIcon size={18} aria-hidden="true" />
        <span>Volver a canales</span>
      </Link>

      <article className="video-card-large" aria-labelledby="video-title">
        <div className="video-card-large__thumbnail-wrapper">
          <img src={video.thumbnail} alt={video.title} className="video-card-large__thumbnail-img" />
        </div>
        <div className="video-card-large__content">
          <header>
            <h1 id="video-title" className="video-card-large__title">{video.title}</h1>
            <ul className="video-card-large__meta" aria-label="Detalles del video">
              <li className="meta-item">
                <UserIcon size={16} aria-hidden="true" />
                <span>{video.channelName}</span>
              </li>
              <li className="meta-item">
                <ClockIcon size={16} aria-hidden="true" />
                <span>{video.duration}</span>
              </li>
              <li className="meta-item">
                <CalendarIcon size={16} aria-hidden="true" />
                <span>{video.publishedDate}</span>
              </li>
            </ul>
          </header>
          
          <div className="video-card-large__summary">
            <h2 className="video-card-large__summary-title">Resumen</h2>
            <div className="prose">
              <ReactMarkdown>{video.summary}</ReactMarkdown>
            </div>
          </div>
        </div>
      </article>

      <aside className="feedback-box" aria-labelledby="feedback-title">
        <h3 id="feedback-title" className="feedback-box__title">¿Te resultó útil este resumen?</h3>
        <p className="feedback-box__subtitle">Ayúdanos a mejorar calificando la calidad del resumen.</p>
        <div className="feedback-box__actions">
          <button className="button button--secondary">👍 Útil</button>
          <button className="button button--secondary">👎 No útil</button>
        </div>
      </aside>
    </main>
  );
};

export default VideoDetail;
