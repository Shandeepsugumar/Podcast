import React, { createContext, useContext, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null); // episode object
  const [isPlaying, setIsPlaying] = useState(false);
  const [podcastPlayCount, setPodcastPlayCount] = useState(() => {
    const stored = localStorage.getItem('podcast_play_count');
    return stored ? parseInt(stored, 10) : 0;
  });
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const AD_AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Replace with your ad audio

  const playTrack = (episode) => {
    setCurrentTrack(episode);
    localStorage.setItem('last_played_episode', JSON.stringify(episode));
    setIsPlaying(true);
    setPodcastPlayCount((prev) => {
      const next = prev + 1;
      localStorage.setItem('podcast_play_count', next);
      return next;
    });
    navigate('/player');
  };

  // Call this before playing a podcast episode
  const playAdIfNeeded = (onAdEnd) => {
    if ((podcastPlayCount > 0) && (podcastPlayCount % 10 === 0)) {
      setCurrentTrack({
        title: 'Sponsored Ad',
        audioUrl: AD_AUDIO_URL
      });
      setIsPlaying(true);
      if (typeof onAdEnd === 'function') {
        // Listen for ad end
        setTimeout(() => {
          setIsPlaying(false);
          onAdEnd();
        }, 10000); // Assume 10s ad, or use audio events
      }
      return true;
    }
    return false;
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      playTrack,
      togglePlay,
      audioRef,
      setIsPlaying,
      podcastPlayCount,
      playAdIfNeeded
    }}>
      {children}
    </PlayerContext.Provider>
  );
}; 