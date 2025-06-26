import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import React, { useRef, useState, useEffect } from 'react';
import { useUser } from '../UserContext';


const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Player state (moved from PlayerContext)
    const [currentTrack, setCurrentTrack] = useState(null); // episode object
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const { user, setUser } = useUser();

    // Function to play a track (can be called from anywhere via window)
    window.playTrack = (episode) => {
        setCurrentTrack(episode);
        setIsPlaying(true);
    };
    window.togglePlay = () => setIsPlaying((prev) => !prev);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack, audioRef]);

    const playTrack = (episode) => {
        setCurrentTrack(episode);
        setIsPlaying(true);
      };
    
      const togglePlay = () => {
        setIsPlaying((prev) => !prev);
      };
    
    const LISTEN_NOTES_API_KEY = "f29537c93b5149d2ada0bf64c95644d3";
    const API_BASE = "https://listen-api.listennotes.com/api/v2";

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearchLoading(true);
        setSearchError(null);
        setShowResults(true);
        try {
            const res = await fetch(
                `${API_BASE}/search?q=${encodeURIComponent(searchQuery)}&type=podcast`,
                { headers: { "X-ListenAPI-Key": LISTEN_NOTES_API_KEY } }
            );
            const data = await res.json();
            setSearchResults(data.results || []);
        } catch (err) {
            setSearchError("Failed to fetch search results.");
        }
        setSearchLoading(false);
    };

    const handleProfileClick = () => {
        if (!user) {
            navigate('/login');
        } else {
            navigate('/profile');
        }
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className="navbar">
            <div className="navbar-left">
                <div className="logo">
                    <span className="logo-icon">🎧</span>
                    <span className="logo-text">PodcastHub</span>
                </div>
                <nav className="nav-links">
                    <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
                    <Link to="/explore" className={location.pathname === '/explore' ? 'active' : ''}>Explore</Link>
                    <Link to="/favorites" className={location.pathname === '/favorites' ? 'active' : ''}>Favorites</Link>
                    <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link>
                </nav>
            </div>
            
            <div className="navbar-center">
                <form className="search-container" onSubmit={handleSearch} style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search podcasts, episodes, or creators..."
                        className="search-input"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onFocus={() => setShowResults(true)}
                    />
                    <button className="search-btn" type="submit">🔍</button>
                    {showResults && (
                        <div className="search-results-dropdown">
                            {searchLoading && <div>Loading...</div>}
                            {searchError && <div style={{ color: 'red' }}>{searchError}</div>}
                            {!searchLoading && !searchError && searchResults.length === 0 && <div>No results found.</div>}
                            {!searchLoading && !searchError && searchResults.length > 0 && (
                                <div>
                                    {searchResults.reduce((acc, podcast) => {
                                        const genre = podcast.genre_ids?.[0] || 'Other';
                                        if (!acc[genre]) acc[genre] = [];
                                        acc[genre].push(podcast);
                                        return acc;
                                    }, {})}
                                </div>
                            )}
                            {!searchLoading && !searchError && searchResults.length > 0 && (
                                Object.entries(
                                    searchResults.reduce((acc, podcast) => {
                                        const genre = podcast.genre_ids?.[0] || 'Other';
                                        if (!acc[genre]) acc[genre] = [];
                                        acc[genre].push(podcast);
                                        return acc;
                                    }, {})
                                ).map(([genre, podcasts]) => (
                                    <div key={genre}>
                                        <strong>{genre}</strong>
                                        {podcasts.map(podcast => (
                                            <div
                                                key={podcast.id}
                                                className="search-result-item"
                                                style={{ cursor: 'pointer', padding: '4px 0' }}
                                                onClick={() => {
                                                    setShowResults(false);
                                                    window.open(podcast.listennotes_url, '_blank');
                                                }}
                                            >
                                                {podcast.title_original}
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </form>
            </div>
            
            <div className="navbar-right">
                <div className="user-menu">
                    <button className="user-btn" onClick={handleProfileClick}>👤</button>
                </div>
                {user && (
                    <>
                        <span style={{ marginLeft: 16 }}>
                            Welcome, <b>{user.name}</b>
                        </span>
                        <button style={{ marginLeft: 16, cursor: 'pointer' }} onClick={handleLogout}>Logout</button>
                    </>
                )}
            </div>
        </header>
    );
};

export default Navbar;