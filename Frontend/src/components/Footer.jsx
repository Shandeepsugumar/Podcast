import React from 'react';
import { FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const PodcastFooter = () => {
  const isDark = false; // Replace with actual theme logic if needed
  return (
    <div style={{
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
      padding: '32px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <i className="fas fa-podcast" style={{ fontSize: '40px', color: '#673ab7' }}></i>
        <div style={{ marginLeft: '12px', fontSize: '22px', fontWeight: 'bold', color: isDark ? '#ffffff' : '#1a1a1a' }}>
          Podcast Library
        </div>
      </div>
      <p style={{ fontSize: '14px', color: '#757575', marginTop: '16px' }}>
        Discover, stream, and save your favorite podcasts. Built for listeners who love quality audio content.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '24px' }}>
        {['Home', 'Browse', 'Top Episodes', 'Categories', 'About Us', 'Contact'].map((title) => (
          <a href="#" style={{ fontSize: '14px', color: '#607d8b', fontWeight: '500' }} key={title}>
            {title}
          </a>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
        <a href="#"><FaTwitter /></a>
        <a href="#"><FaInstagram /></a>
        <a href="#"><FaLinkedin /></a>
        <a href="#"><FaYoutube /></a>
      </div>
      <hr style={{ borderColor: '#bdbdbd', marginTop: '16px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
        <span style={{ fontSize: '12px', color: '#9e9e9e' }}>© 2025 Podcast Library. All rights reserved.</span>
        <span style={{ fontSize: '12px', color: '#9e9e9e' }}>Privacy Policy | Terms of Use</span>
      </div>
    </div>
  );
};

export default PodcastFooter; 