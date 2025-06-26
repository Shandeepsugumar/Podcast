import React from 'react';
import { useLocation } from 'react-router-dom';

const PlayerPage = () => {
  const location = useLocation();
  const podcast = location.state?.podcast;

  if (!podcast) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>No podcast selected.</div>;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', color: '#fff', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 24 }}>
          <img src={podcast.images[0]?.url} alt={podcast.name} style={{ width: 200, borderRadius: 16 }} />
          <div>
            <h1 style={{ margin: 0 }}>{podcast.name}</h1>
            <p>{podcast.description}</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', margin: '32px 0 0 0' }}>
          <a href={podcast.external_urls.spotify} target="_blank" rel="noopener noreferrer">
            <button style={{ background: '#1DB954', color: '#fff', border: 'none', borderRadius: 24, padding: '12px 32px', fontSize: 18, cursor: 'pointer' }}>
              Visit on Spotify
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage; 