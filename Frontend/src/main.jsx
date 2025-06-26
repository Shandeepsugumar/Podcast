import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import ReactDOM from 'react-dom/client';
import { PlayerProvider } from './components/PlayerContext';
import { UserProvider } from './UserContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PlayerProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </PlayerProvider>
    </BrowserRouter>
  </StrictMode>,
)
