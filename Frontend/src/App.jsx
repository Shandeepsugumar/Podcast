import './App.css'
import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Favorites from './pages/Favorites';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PlayerPage from './pages/PlayerPage';
import Profile from './pages/Profile';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import AdBanner from './components/AdBanner';

const BACKEND_API_URL = "https://podcast-0wqi.onrender.com/api/search";

function App() {
  const [featuredPodcasts, setFeaturedPodcasts] = useState([]);
  const [trendingShows, setTrendingShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    setError(null);
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
  }, []);

  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home featuredPodcasts={featuredPodcasts} trendingShows={trendingShows} loading={loading} error={error} />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/player" element={<PlayerPage />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <ChatBot podcasts={[...featuredPodcasts, ...trendingShows]} />
      <AdBanner />
      {![
        '/favorites',
        '/about',
        '/profile',
        '/login',
        '/signup'
      ].includes(location.pathname) && <Footer />}
    </div>
  );
}

export default App;
