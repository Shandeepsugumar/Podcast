import React, { useState } from 'react';
import './AdBanner.css';

const AdBanner = () => {
  const [visible, setVisible] = useState(true);

  return (
    <div className={`ad-banner${visible ? '' : ' ad-banner-hidden'}`}>
      {visible ? (
        <>
          <button className="ad-toggle-btn" onClick={() => setVisible(false)} title="Hide Ad">&#x25BC;</button>
          <a href="https://www.example.com" target="_blank" rel="noopener noreferrer">
            <img src="https://podsearchad.com/wp-content/uploads/2022/10/podsearchad-podcasts-version_04.png" alt="Ad Banner" />
          </a>
        </>
      ) : (
        <button className="ad-toggle-btn" onClick={() => setVisible(true)} title="Show Ad">&#x25B2; Show Ad</button>
      )}
    </div>
  );
};

export default AdBanner;
