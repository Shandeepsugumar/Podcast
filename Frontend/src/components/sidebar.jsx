import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import '../components/sidebar.css';
import { usePlayer } from './PlayerContext';

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

const Sidebar = ({ onCategorySelect }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [search, setSearch] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { playTrack } = usePlayer();

    // Filter navigation and categories by search
    const filteredNavLinks = navLinks.filter(link =>
        link.label.toLowerCase().includes(search.toLowerCase())
    );
    const filteredCategories = itunesCategories.filter(category =>
        category.name.toLowerCase().includes(search.toLowerCase())
    );

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
            </aside>
        </div>
    );
};

export default Sidebar;