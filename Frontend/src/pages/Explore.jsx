import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Explore.css';

const BACKEND_API_URL = 'http://127.0.0.1:8888/api/search';

const Explore = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('technology'); // default search
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${BACKEND_API_URL}?query=${encodeURIComponent(search)}`)
      .then(res => res.json())
      .then(data => {
        setPodcasts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch podcasts');
        setLoading(false);
      });
  }, [search]);

  const handlePlay = (podcast) => {
    navigate('/player', { state: { podcast } });
  };

  return (
    <div className="explore-container">
      <h1 className="explore-title">Explore Podcasts</h1>
      <div className="explore-search-bar-container">
        <input
          className="explore-search-bar"
          type="text"
          placeholder="Search podcasts by title or publisher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {loading && <div className="explore-loading">Loading podcasts...</div>}
      {error && <div className="explore-error">{error}</div>}
      <div className="podcast-grid">
        {podcasts.map(podcast => (
          <div key={podcast.id} className="podcast-card">
            <img src={podcast.images[0]?.url} alt={podcast.name} className="podcast-image" />
            <h3 className="podcast-title">{podcast.name}</h3>
            <p className="podcast-publisher">{podcast.publisher}</p>
            <a href={podcast.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="podcast-link">View on Spotify</a>
            <button
              className="podcast-play-btn"
              onClick={() => handlePlay(podcast)}
            >
              ▶ Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore; 