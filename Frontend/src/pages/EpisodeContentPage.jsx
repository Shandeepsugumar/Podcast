import React from 'react';
import { useLocation } from 'react-router-dom';

const EpisodeContentPage = () => {
  const location = useLocation();
  const episode = location.state?.episode;

  if (!episode) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>No episode selected.</div>;

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', color: '#fff', padding: '20px', background: '#1e1e1e', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
      <h1 style={{ color: '#4db8ff' }}>{episode.title}</h1>
      <p style={{ color: '#ccc', marginBottom: '16px' }}>{episode.pubDate}</p>
      <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#aaa' }}>
        {episode.description}
      </div>
    </div>
  );
};

export default EpisodeContentPage; 