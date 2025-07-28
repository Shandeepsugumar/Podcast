import './App.css'
import Navbar from './components/Navbar'
import { Route, Router, Routes } from 'react-router-dom'
import './components/Navbar.css'
import About from './pages/About'
import Favorites from './pages/Favorites'
import Explore from './pages/Explore'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Sidebar from './components/sidebar'
import PlayerPage from './pages/PlayerPage'
import Profile from './pages/Profile'
import Footer from './components/Footer';

function App() {

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingTop: '80px' }}>
      <Navbar/>
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<><Sidebar /><Home /></>} />
          <Route path="/explore" element={<><Sidebar /><Explore /></>} />
          <Route path="/favorites" element={<><Sidebar /><Favorites /></>} />
          <Route path="/about" element={<><Sidebar /><About /></>} />
          <Route path="/login" element={<><Sidebar /><Login /></>} />
          <Route path="/signup" element={<><Sidebar /><Signup /></>} />
          <Route path="/player" element={<><Sidebar /><PlayerPage /></>} />
          <Route path="/profile" element={<><Sidebar /><Profile /></>} />
        </Routes>
      </div>
    </div>
  )
}

export default App
