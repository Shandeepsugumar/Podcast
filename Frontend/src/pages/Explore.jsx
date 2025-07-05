import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Explore.css';
import { useUser } from '../UserContext';
import Sidebar from '../components/sidebar';

const BACKEND_API_URL = 'http://localhost:3000/api/search';
const API_LIKED_URL = 'http://localhost:3000/api/liked';

const Explore = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('news'); // default search
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) setSearch(category);
  }, [location]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${BACKEND_API_URL}?query=${encodeURIComponent(search)}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setPodcasts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch podcasts');
        setLoading(false);
      });
  }, [search]);

  // Fetch liked podcasts for the user
  useEffect(() => {
    const fetchLiked = async () => {
      if (!user || !user.email) return setFavorites([]);
      const res = await fetch(`${API_LIKED_URL}?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const liked = await res.json();
        setFavorites(Array.isArray(liked) ? liked : []);
      }
    };
    fetchLiked();
  }, [user]);

  const isFavorited = (item) => favorites.some(fav => fav.id === item.id);

  const handleLike = async (podcast) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const token = localStorage.getItem('token');
    if (isFavorited(podcast)) {
      // Unlike
      await fetch('http://localhost:3000/api/unlike', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, podcastId: podcast.id })
      });
    } else {
      // Like
      await fetch('http://localhost:3000/api/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ podcast: { ...podcast, favoriteType: 'podcast' } })
      });
    }
    // Refresh favorites after like/unlike
    const res = await fetch(`${API_LIKED_URL}?email=${encodeURIComponent(user.email)}`);
    if (res.ok) {
      const liked = await res.json();
      setFavorites(Array.isArray(liked) ? liked : []);
    }
  };

  const handlePlay = (podcast) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/player', { state: { podcast } });
  };

  // Handler for category selection from Sidebar
  const handleCategorySelect = (category) => {
    setSearch(category);
  };

  return (
    <div className="explore-root" style={{ display: 'flex' }}>
      <Sidebar onCategorySelect={handleCategorySelect} />
      <div className="explore-container" style={{ flex: 1 }}>
        <h1 className="explore-title">Explore Podcasts</h1>
        <div className="explore-search-bar-container">
          <input
            className="explore-search-bar"
            type="text"
            placeholder="Search podcasts by topic (e.g. news, comedy, sports, music, business, education)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {loading && <div className="explore-loading">Loading podcasts...</div>}
        {error && <div className="explore-error">{error}</div>}
        <div className="podcast-grid">
          {podcasts.map(podcast => (
            <div key={podcast.id} className="podcast-card" style={{ cursor: 'pointer', position: 'relative' }}>
              <img src={podcast.images[0]?.url} alt={podcast.name} className="podcast-image" onClick={() => handlePlay(podcast)} />
              <div className="card-content">
                <h3 className="card-title" onClick={() => handlePlay(podcast)}>{podcast.name}</h3>
                <p className="podcast-publisher" onClick={() => handlePlay(podcast)}>{podcast.publisher}</p>
                <div className="card-meta">
                  <span className="listeners">{podcast.total_episodes} episodes</span>
                </div>
              </div>
              <button
                className="like-btn"
                style={{ position: 'absolute', top: 10, right: 10, color: isFavorited(podcast) ? 'red' : '#aaa', fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', zIndex: 2 }}
                onClick={e => { e.stopPropagation(); handleLike(podcast); }}
                title={isFavorited(podcast) ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                ♥
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore; 