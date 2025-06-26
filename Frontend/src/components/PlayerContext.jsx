import React, { createContext, useContext, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null); // episode object
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const playTrack = (episode) => {
    setCurrentTrack(episode);
    localStorage.setItem('last_played_episode', JSON.stringify(episode));
    setIsPlaying(true);
    navigate('/player');
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
      setIsPlaying
    }}>
      {children}
    </PlayerContext.Provider>
  );
}; 