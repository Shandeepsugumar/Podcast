import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import "../App.css";
import "../components/sidebar.css";
import "../components/Navbar.css";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';

const BACKEND_API_URL = "https://podcast-0wqi.onrender.com/api/search";
const API_LIKED_URL = "https://podcast-0wqi.onrender.com/api/liked";
const API_LIKE_URL = "https://podcast-0wqi.onrender.com/api/like";
const FAVORITES_KEY = "podcast_favorites";

const getFavoritesFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
};

const saveFavoritesToStorage = (favorites) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

const Home = () => {
    const [featuredPodcasts, setFeaturedPodcasts] = useState([]);
    const [trendingShows, setTrendingShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState(getFavoritesFromStorage());
    const navigate = useNavigate();
    const { user } = useUser();

    // Fetch liked podcasts from backend after login
    const fetchLikedPodcasts = async () => {
      const token = localStorage.getItem('token');
      if (!token || !user || !user.email) return;
      try {
        const res = await fetch(`${API_LIKED_URL}?email=${encodeURIComponent(user.email)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const liked = await res.json();
          setFavorites(liked);
          saveFavoritesToStorage(liked);
        }
      } catch (err) {
        // Optionally handle error
      }
    };

    useEffect(() => {
        setLoading(true);
        setError(null);
        // Fetch featured and trending podcasts from backend (iTunes)
        Promise.all([
          fetch(`${BACKEND_API_URL}?query=news`).then(res => res.ok ? res.json() : []),
          fetch(`${BACKEND_API_URL}?query=comedy`).then(res => res.ok ? res.json() : [])
        ])
        .then(([featured, trending]) => {
          setFeaturedPodcasts(Array.isArray(featured) ? featured : []);
          setTrendingShows(Array.isArray(trending) ? trending : []);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load podcast data.");
          setLoading(false);
        });
        // Fetch liked podcasts after login
        fetchLikedPodcasts();
    }, []);

    useEffect(() => {
      if (user && user.email) {
        fetchLikedPodcasts();
      }
    }, [user]);

    useEffect(() => {
      saveFavoritesToStorage(favorites);
    }, [favorites]);

    const isFavorited = (item) => favorites.some(fav => fav.id === item.id);

    const handleLike = async (podcast) => {
      if (!user) {
        navigate('/login');
        return;
      }
      const token = localStorage.getItem('token');
      if (isFavorited(podcast)) {
        // Unlike
        await fetch('https://podcast-0wqi.onrender.com/api/unlike', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, podcastId: podcast.id })
        });
      } else {
        // Like
        await fetch('https://podcast-0wqi.onrender.com/api/like', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ podcast: { ...podcast, favoriteType: 'podcast' } })
        });
      }
      fetchLikedPodcasts();
    };

    const handleCardClick = (podcast) => {
      if (!user) {
        navigate('/login');
        return;
      }
      navigate('/player', { state: { podcast } });
    };

    return (
        <div className="home-root">
            <Navbar />
            <div className="app">
                <Sidebar />
                <main className="main-content">
                    <div className="welcome-section">
                        <h1>Welcome back! 👋</h1>
                        <p>Discover amazing podcasts and stay updated with your favorite shows.</p>
                    </div>

                    {loading && <div style={{margin: '2rem 0'}}>Loading...</div>}
                    {error && <div style={{color: 'red', margin: '2rem 0'}}>{error}</div>}

                    {!loading && !error && <>
                    <section className="section">
                        <div className="section-header">
                            <h2>🎯 Featured Podcasts</h2>
                        </div>
                        <div className="cards">
                            {featuredPodcasts.map((podcast) => (
                                <div key={podcast.id} className="card podcast-card" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => handleCardClick(podcast)}>
                                    <img src={podcast.images[0]?.url} alt={podcast.name} style={{ width: "100%", borderRadius: 8 }} />
                                    <div className="card-content">
                                        <h3 className="card-title">{podcast.name}</h3>
                                        <p className="card-host">{podcast.publisher}</p>
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
                    </section>

                    <section className="section">
                        <div className="section-header">
                            <h2>🔥 Trending Shows</h2>
                        </div>
                        <div className="cards">
                            {trendingShows.map((show) => (
                                <div key={show.id} className="card show-card" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => handleCardClick(show)}>
                                    <img src={show.images[0]?.url} alt={show.name} style={{ width: "100%", borderRadius: 8 }} />
                                    <div className="card-content">
                                        <h3 className="card-title">{show.name}</h3>
                                        <p className="card-category">{show.publisher}</p>
                                        <div className="card-meta">
                                            <span className="listeners">{show.total_episodes} episodes</span>
                                        </div>
                                    </div>
                                    <button
                                      className="like-btn"
                                      style={{ position: 'absolute', top: 10, right: 10, color: isFavorited(show) ? 'red' : '#aaa', fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', zIndex: 2 }}
                                      onClick={e => { e.stopPropagation(); handleLike(show); }}
                                      title={isFavorited(show) ? 'Remove from Favorites' : 'Add to Favorites'}
                                    >
                                      ♥
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                    </>}
                </main>
            </div>
        </div>
    );
};

export default Home;