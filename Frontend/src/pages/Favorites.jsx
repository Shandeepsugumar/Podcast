import React, { useEffect, useState } from 'react';
import { usePlayer } from '../components/PlayerContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../UserContext';

const FAVORITES_KEY = "podcast_favorites";

const getFavoritesFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
};

const Favorites = () => {
    const { user } = useUser();
    const [favorites, setFavorites] = useState([]);
    const [embedUrl, setEmbedUrl] = useState(null);
    const [search, setSearch] = useState('');
    const { playTrack } = usePlayer();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      console.log('Current user:', user);
      if (!user || !user.email) return;
      fetch(`http://localhost:3000/api/liked?email=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => setFavorites(Array.isArray(data) ? data : []));
    }, [user, location]);

    const filteredFavorites = Array.isArray(favorites) ? favorites.filter(fav =>
      (fav.title && fav.title.toLowerCase().includes(search.toLowerCase())) ||
      (fav.publisher && fav.publisher.toLowerCase().includes(search.toLowerCase())) ||
      (fav.podcast_title && fav.podcast_title.toLowerCase().includes(search.toLowerCase()))
    ) : [];

    const podcasts = filteredFavorites.filter(fav => fav.favoriteType === 'podcast');
    const episodes = filteredFavorites.filter(fav => fav.favoriteType === 'episode');

    const handleCardClick = (podcast) => {
      if (!user) {
        navigate('/login');
        return;
      }
      navigate('/player', { state: { podcast } });
    };

    if (!user) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Please log in to view your favorites.</div>;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
            <h1>Favorites</h1>
            <div className="explore-search-bar-container">
              <input
                className="explore-search-bar"
                type="text"
                placeholder="Search favorites by title or publisher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {favorites.length === 0 && <p>No favorites yet. Like a podcast or episode to see it here!</p>}

            {podcasts.length > 0 && <>
              <h2>Podcasts</h2>
              <div className="cards">
                {podcasts.map(podcast => (
                  <div key={podcast.id} className="card podcast-card" style={{ cursor: 'pointer' }} onClick={() => handleCardClick(podcast)}>
                    <img src={podcast.images && podcast.images[0]?.url} alt={podcast.name || podcast.title} style={{ width: "100%", borderRadius: 8 }} />
                    <div className="card-content">
                      <h3 className="card-title">{podcast.name || podcast.title}</h3>
                      <p className="card-host">{podcast.publisher}</p>
                      <div className="card-meta">
                        <span className="listeners">{podcast.total_episodes} episodes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>}

            {episodes.length > 0 && <>
              <h2>Episodes</h2>
              <div className="episode-list-container">
                {episodes.map(episode => (
                  <div key={episode.id} className="episode-item">
                    <div className="episode-info">
                      <h3 className="episode-title">{episode.title}</h3>
                      <p className="episode-show">{episode.podcast?.title || episode.podcast_title || ""}</p>
                      <div className="episode-meta">
                        <span className="episode-duration">{Math.round((episode.audio_length_sec || 0) / 60)} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>}

            {embedUrl && (
              <div className="episode-modal" onClick={() => setEmbedUrl(null)}>
                <div className="episode-modal-content" onClick={e => e.stopPropagation()}>
                  <button className="close-btn" onClick={() => setEmbedUrl(null)}>✖</button>
                  <iframe
                    src={embedUrl}
                    height="200px"
                    width="100%"
                    frameBorder="0"
                    scrolling="no"
                    allow="autoplay; clipboard-write"
                    title="Podcast Player"
                  ></iframe>
                </div>
              </div>
            )}
        </div>
    )
}

export default Favorites