import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const PlayerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const podcast = location.state?.podcast;
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (podcast?.feedUrl) {
      setLoading(true);
      setError(null);
      fetch(`http://localhost:3000/api/episodes?feedUrl=${encodeURIComponent(podcast.feedUrl)}`)
        .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch episodes'))
        .then(data => {
          setEpisodes(data);
          setSelectedEpisode(data[0] || null);
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to load episodes.');
          setLoading(false);
        });
    }
  }, [podcast]);

  useEffect(() => {
    // If there are no episodes, just show a message (do not navigate away)
    // Optionally, you could call a backend endpoint to remove the podcast from favorites, etc.
    // (Removed the setTimeout and navigate logic)
  }, [loading, error, episodes, podcast]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };
  const handleSelectEpisode = (ep) => {
    setSelectedEpisode(ep);
    setIsPlaying(false);
    setTimeout(() => {
      if (audioRef.current) audioRef.current.load();
    }, 0);
  };

  if (!podcast) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>No podcast selected.</div>;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', color: '#fff', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 24 }}>
          <img src={podcast.images[0]?.url} alt={podcast.name} style={{ width: 200, borderRadius: 16, boxShadow: '0 4px 16px #0004' }} />
          <div>
            <h1 style={{ margin: 0 }}>{podcast.name}</h1>
            <p style={{ color: '#ccc', margin: '8px 0' }}>{podcast.publisher}</p>
            <p style={{ fontSize: 16 }}>{podcast.description}</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', margin: '32px 0 0 0' }}>
          {loading && <div>Loading episodes...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {!loading && !error && episodes.length > 0 && (
            <>
              <audio ref={audioRef} controls style={{ width: '100%', marginBottom: 16 }}>
                <source src={selectedEpisode?.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <div style={{ marginBottom: 16 }}>
                <button
                  style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: 24, padding: '12px 32px', fontSize: 18, cursor: 'pointer', marginRight: 8 }}
                  onClick={handlePlay}
                  disabled={isPlaying || !selectedEpisode}
                >
                  ▶ Play
                </button>
                <button
                  style={{ background: '#aaa', color: '#fff', border: 'none', borderRadius: 24, padding: '12px 32px', fontSize: 18, cursor: 'pointer' }}
                  onClick={handlePause}
                  disabled={!isPlaying}
                >
                  ❚❚ Pause
                </button>
              </div>
              <div style={{ textAlign: 'left', margin: '0 auto', maxWidth: 700 }}>
                <h2>Episodes</h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {episodes.map((ep, idx) => (
                    <li key={idx} style={{ marginBottom: 16, background: selectedEpisode === ep ? '#222' : 'transparent', borderRadius: 8, padding: 8 }}>
                      <div style={{ fontWeight: 'bold', cursor: 'pointer', color: selectedEpisode === ep ? '#4db8ff' : '#fff' }} onClick={() => handleSelectEpisode(ep)}>
                        {ep.title}
                      </div>
                      <div style={{ fontSize: 14, color: '#ccc' }}>{ep.pubDate}</div>
                      <div style={{ fontSize: 14, color: '#aaa' }}>{ep.description}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
          {!loading && !error && episodes.length === 0 && (
            <div style={{ color: '#ccc', fontSize: 18, margin: '2rem 0' }}>
              No episodes available for this podcast.<br />
              This podcast may be unavailable or not have any public episodes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerPage; 