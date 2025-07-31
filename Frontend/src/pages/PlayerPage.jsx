import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PlayerPage.css';
import Sidebar from '../components/sidebar';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// Update the EpisodeCard component to display individual episodes in a row
const EpisodeCard = ({ episode, isSelected, onSelect, onPlay, onViewContent }) => {
  // Update the cardStyle to match the podcast card hover effect
  const cardStyle = {
    background: isSelected ? 'linear-gradient(135deg, #ff9a9e, #fad0c4)' : 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    borderRadius: '15px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    padding: '20px',
    marginBottom: '20px',
    transition: 'transform 0.4s, box-shadow 0.4s, z-index 0.4s',
    cursor: 'pointer',
    width: '260px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  };

  return (
    <div style={cardStyle} className="episode-card">
      <div style={{ fontWeight: '700', color: '#fff', marginBottom: '14px', fontSize: '18px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)' }}>{episode.title}</div>
      <button onClick={onPlay} style={{ background: '#ff6f61', color: '#fff', border: 'none', borderRadius: '20px', padding: '12px 24px', fontSize: '15px', cursor: 'pointer', marginBottom: '12px', transition: 'background 0.3s', ':hover': { background: '#e55b50' } }}>
        ▶ Play
      </button>
    </div>
  );
};

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
      fetch(`https://podcast-0wqi.onrender.com/api/episodes?feedUrl=${encodeURIComponent(podcast.feedUrl)}`)
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

  // Add a function to handle playing the selected episode
  const handlePlayEpisode = (episode) => {
    setSelectedEpisode(episode);
    setIsPlaying(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play();
        setIsPlaying(true);
      }
    }, 0);
  };

  // Update the EpisodeCard component usage to include the play functionality
  const handleViewContent = (episode) => {
    // This function is not fully implemented in the original code,
    // but it's included in the edit hint.
    // For now, it will just log the episode title.
    console.log(`Viewing content for episode: ${episode.title}`);
    // Example: Navigate to a new page for content
    // navigate('/episode-content', { state: { episode } });
  };

  if (!podcast) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>No podcast selected.</div>;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="player-main-content" style={{ maxWidth: 900, color: '#fff', minHeight: '80vh', display: 'flex', flexDirection: 'column', flex: 1 }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {episodes.map((ep, idx) => (
                    <EpisodeCard
                      key={idx}
                      episode={ep}
                      isSelected={selectedEpisode === ep}
                      onSelect={() => handleSelectEpisode(ep)}
                      onPlay={() => handlePlayEpisode(ep)}
                      onViewContent={() => handleViewContent(ep)}
                    />
                  ))}
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
    </div>
  );
};

export default PlayerPage; 