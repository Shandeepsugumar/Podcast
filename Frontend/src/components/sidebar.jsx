import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css';
import '../components/sidebar.css';
import { usePlayer } from './PlayerContext';

const Sidebar = () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const location = useLocation();
    const { playTrack } = usePlayer();
    
    const categories = [
        { name: 'Technology', icon: '💻',},
        { name: 'Business', icon: '💼',},
        { name: 'Science', icon: '🔬',},
        { name: 'Health', icon: '🏥',},
        { name: 'Education', icon: '📚', },
        { name: 'Entertainment', icon: '🎬', },
        { name: 'News', icon: '📰', },
        { name: 'Sports', icon: '⚽', }
    ];
    
    const quickActions = [
        { name: 'Recently Played', icon: '🕒' },
        { name: 'Downloaded', icon: '⬇️' },
        { name: 'Subscriptions', icon: '⭐' },
        { name: 'Playlists', icon: '📋' }
    ];

    const handleRecentlyPlayed = (e) => {
        e.preventDefault();
        try {
            const lastPlayed = localStorage.getItem('last_played_episode');
            if (lastPlayed) {
                playTrack(JSON.parse(lastPlayed));
            } else {
                alert('No recently played episode found.');
            }
        } catch {
            alert('No recently played episode found.');
        }
    };

    return (
        <div className="sidebar-container">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? "✖" : "☰"}
            </button>
            <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
                <div className="sidebar-header">
                    <br/>
                    <br/>
                    <h2>🎧 Podcasts</h2>
                    <div className="sidebar-search-container">
                        <input className="sidebar-search" type="text" placeholder="Search podcasts..." />
                        <button className="search-icon">🔍</button>
                    </div>
                </div>
                
                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <h3>Navigation</h3>
                        <ul>
                            <li>
                                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                                    🏠 Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/explore" className={location.pathname === '/explore' ? 'active' : ''}>
                                    🔍 Explore
                                </Link>
                            </li>
                            <li>
                                <Link to="/favorites" className={location.pathname === '/favorites' ? 'active' : ''}>
                                    ❤️ Favorites
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
                                    ℹ️ About
                                </Link>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="nav-section">
                        <h3>Quick Actions</h3>
                        <ul>
                            <li>
                                <a href="#" className="sidebar-link" onClick={handleRecentlyPlayed}>
                                    🕒 Recently Played
                                </a>
                            </li>
                            {quickActions.slice(1).map((action, index) => (
                                <li key={index}>
                                    <a href="#" className="sidebar-link">
                                        {action.icon} {action.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="nav-section">
                        <h3>Categories</h3>
                        <ul>
                            {categories.map((category, index) => (
                                <li key={index}>
                                    <a href="#" className="sidebar-link">
                                        <span className="category-icon">{category.icon}</span>
                                        <span className="category-name">{category.name}</span>
                                        <span className="category-count">{category.count}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
                
                <div className="sidebar-footer">
                    <div className="storage-info">
                        <span>Storage: 2.3 GB / 10 GB</span>
                        <div className="storage-bar">
                            <div className="storage-fill" style={{width: '23%'}}></div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default Sidebar;