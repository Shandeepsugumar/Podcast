import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import '../components/sidebar.css';
import { usePlayer } from './PlayerContext';
import { useUser } from '../UserContext';

// iTunes podcast categories
const itunesCategories = [
    { name: 'Arts', icon: '🎨' },
    { name: 'Business', icon: '💼' },
    { name: 'Comedy', icon: '😂' },
    { name: 'Education', icon: '📚' },
    { name: 'Health', icon: '🏥' },
    { name: 'Kids & Family', icon: '👨‍👩‍👧‍👦' },
    { name: 'Music', icon: '🎵' },
    { name: 'News', icon: '📰' },
    { name: 'Religion & Spirituality', icon: '🙏' },
    { name: 'Science', icon: '🔬' },
    { name: 'Society & Culture', icon: '🌎' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Technology', icon: '💻' },
    { name: 'TV & Film', icon: '🎬' },
    { name: 'True Crime', icon: '🕵️‍♂️' },
    { name: 'History', icon: '📜' },
    { name: 'Leisure', icon: '🎲' },
    { name: 'Government', icon: '🏛️' },
    { name: 'Fiction', icon: '📖' },
    { name: 'Sports', icon: '🏅' }
];

const navLinks = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/explore', label: 'Explore', icon: '🔍' },
    { to: '/favorites', label: 'Favorites', icon: '❤️' },
    { to: '/about', label: 'About', icon: 'ℹ️' }
];

const getAvatarUrl = (nameOrEmail) => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameOrEmail)}`;
};

const Sidebar = ({ onCategorySelect }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [search, setSearch] = useState('');
    const [profileImgUrl, setProfileImgUrl] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { playTrack } = usePlayer();
    const { user, setUser } = useUser();

    useEffect(() => {
        if (!user) {
            setProfileImgUrl(null);
            return;
        }
        const fetchProfileImg = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch('https://podcast-0wqi.onrender.com/api/profile/image', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const blob = await res.blob();
                setProfileImgUrl(URL.createObjectURL(blob));
            } else {
                setProfileImgUrl(null);
            }
        };
        fetchProfileImg();
    }, [user]);

    // Filter navigation and categories by search
    const filteredNavLinks = navLinks.filter(link =>
        link.label.toLowerCase().includes(search.toLowerCase())
    );
    const filteredCategories = itunesCategories.filter(category =>
        category.name.toLowerCase().includes(search.toLowerCase())
    );

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
        <div className="sidebar-container">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? "\u2716" : "\u2630"}
            </button>
            <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
                <br/>
                <br/>
                {/* Profile Section here, just after toggle */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '1.2rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    minHeight: 64
                  }}
                  onClick={handleProfileClick}
                >
                  <img
                    src={profileImgUrl || (user && (user.name || user.email) ? getAvatarUrl(user.name || user.email) : getAvatarUrl('Guest'))}
                    alt="Profile"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: '#eee',
                      border: '2px solid #667eea',
                      boxShadow: '0 2px 8px #0004',
                      objectFit: 'cover',
                      minWidth: 48,
                      minHeight: 48
                    }}
                    onError={e => { e.target.onerror = null; e.target.src = getAvatarUrl('Guest'); }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.1rem' }}>
                      {user ? user.name : 'Guest'}
                    </div>
                    <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                      {user ? user.email : 'Not logged in'}
                    </div>
                  </div>
                </div>
                <div className="sidebar-header">
                    <h2>🎧 Podcasts</h2>
                    <div className="sidebar-search-container">
                        <input className="sidebar-search" type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                        <button className="search-icon">🔍</button>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <h3>Navigation</h3>
                        <ul>
                            {filteredNavLinks.map(link => (
                                <li key={link.to}>
                                    <Link to={link.to} className={location.pathname === link.to ? 'active' : ''}>
                                        {link.icon} {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="nav-section">
                        <h3>Categories</h3>
                        <ul>
                            {filteredCategories.map((category, index) => (
                                <li key={index}>
                                    <a href="#" className="sidebar-link" onClick={e => { e.preventDefault(); navigate(`/explore?category=${encodeURIComponent(category.name)}`); }}>
                                        <span className="category-icon">{category.icon}</span>
                                        <span className="category-name">{category.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
                {/* Logout/Login Button at the bottom */}
                <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {user ? (
                        <button onClick={handleLogout} style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>Logout</button>
                    ) : (
                        <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>Login</button>
                    )}
                </div>
            </aside>
        </div>
    );
};

export default Sidebar;