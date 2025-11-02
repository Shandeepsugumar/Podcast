import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-section">
          <span className="footer-logo">🎙️ Podcast Library</span>
          <p className="footer-desc">Discover, listen, and enjoy your favorite podcasts all in one place. Curated for podcast lovers.</p>
        </div>
        <div className="footer-section">
          <nav>
            <a href="/about">About</a>
            <a href="/explore">Explore</a>
            <a href="/favorites">Favorites</a>
            <a href="/profile">Profile</a>
          </nav>
          <div className="footer-social">
            <a href="#" title="Twitter" className="footer-social-icon">🐦</a>
            <a href="#" title="Facebook" className="footer-social-icon">📘</a>
            <a href="#" title="Instagram" className="footer-social-icon">📸</a>
          </div>
        </div>
        <div className="footer-section">
          <div className="footer-contact">
            <div>Contact: <a href="mailto:support@podcastlibrary.com">support@podcastlibrary.com</a></div>
            <div>Location: Podcast City, Internet</div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Podcast Library. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer; 