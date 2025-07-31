import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatBot.css';

const moodKeywords = {
  happy: ['happy', 'joy', 'fun', 'good', 'smile', 'laugh'],
  sad: ['sad', 'life', 'help', 'cope', 'overcome', 'support'],
  motivated: ['motivate', 'success', 'achieve', 'inspire', 'goal', 'drive'],
  comedy: ['comedy', 'funny', 'laugh', 'joke'],
  sports: ['sport', 'football', 'soccer', 'basketball', 'cricket', 'tennis'],
  tv: ['tv', 'movie', 'film', 'cinema', 'series', 'show'],
};

const ChatBot = ({ podcasts = [] }) => {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState(null);
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]); // {sender: 'user'|'bot', text: string}
  const [suggested, setSuggested] = useState([]);
  const navigate = useNavigate();

  // Filter podcasts by mood keywords
  const filterPodcasts = (mood) => {
    const keywords = moodKeywords[mood] || [];
    return podcasts.filter(podcast =>
      keywords.some(kw =>
        (podcast.name && podcast.name.toLowerCase().includes(kw)) ||
        (podcast.publisher && podcast.publisher.toLowerCase().includes(kw))
      )
    );
  };

  const handlePlay = (podcast) => {
    setOpen(false);
    setMood(null);
    setChat([]);
    setSuggested([]);
    navigate('/player', { state: { podcast } });
  };

  // Analyze user message and suggest podcasts
  const handleUserMessage = (msg) => {
    setChat(prev => [...prev, { sender: 'user', text: msg }]);
    const lowerMsg = msg.toLowerCase();
    // Greeting intent
    if (/\b(hi|hello|hey|greetings|hi there)\b/.test(lowerMsg)) {
      setChat(prev => [...prev, { sender: 'bot', text: 'Hi, how are you? 😊' }]);
      return;
    }
    // Lonely intent
    if (/lonely|alone|no one|by myself/.test(lowerMsg)) {
      setChat(prev => [...prev, { sender: 'bot', text: "Don't feel lonely! Here's something for you." }]);
      setTimeout(() => {
        setOpen(false);
        setMood(null);
        setChat([]);
        setSuggested([]);
        navigate('/explore?category=Kids%20%26%20Family');
      }, 1200);
      return;
    }
    // Angry intent
    if (/angry|anger|mad|furious|annoyed/.test(lowerMsg)) {
      setChat(prev => [...prev, { sender: 'bot', text: "Don't be angry! Laughter is the best medicine. Let me suggest something for you." }]);
      setTimeout(() => {
        setOpen(false);
        setMood(null);
        setChat([]);
        setSuggested([]);
        navigate('/explore?category=Comedy');
      }, 1200);
      return;
    }
    // Happy intent
    if (/happy|joyful|excited|delighted|glad/.test(lowerMsg)) {
      setChat(prev => [...prev, { sender: 'bot', text: "That's wonderful! Let me suggest something for you." }]);
      setTimeout(() => {
        setOpen(false);
        setMood(null);
        setChat([]);
        setSuggested([]);
        navigate('/explore?category=Education');
      }, 1200);
      return;
    }
    // Fallback: previous keyword-based suggestion
    let foundMood = null;
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(kw => lowerMsg.includes(kw))) {
        foundMood = mood;
        break;
      }
    }
    if (foundMood) {
      const results = filterPodcasts(foundMood);
      setSuggested(results);
      setChat(prev => [...prev, { sender: 'bot', text: `Here are some podcasts for "${foundMood}"!` }]);
    } else {
      setSuggested([]);
      setChat(prev => [...prev, { sender: 'bot', text: "Sorry, I couldn't find podcasts for that. Try another topic!" }]);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      handleUserMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="chatbot-floating-btn"
          aria-label="Open chatbot"
        >🤖</button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="chatbot-window">
          <button
            onClick={() => { setOpen(false); setMood(null); setChat([]); setSuggested([]); }}
            className="chatbot-close-btn"
            aria-label="Close chatbot"
          >✖</button>
          {/* Message typing box */}
          <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 8 }}>
            {chat.map((msg, idx) => (
              <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '4px 0' }}>
                <span style={{ background: msg.sender === 'user' ? '#6c63ff' : '#393e46', color: '#fff', borderRadius: 6, padding: '6px 10px', display: 'inline-block', maxWidth: '80%' }}>{msg.text}</span>
              </div>
            ))}
          </div>
          {suggested.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              {suggested.map(podcast => (
                <div key={podcast.id} style={{ marginBottom: 12, background: '#393e46', borderRadius: 6, padding: 8 }}>
                  <div style={{ fontWeight: 500 }}>{podcast.name}</div>
                  <div style={{ fontSize: 13, color: '#aaa', marginBottom: 4 }}>{podcast.publisher}</div>
                  <button
                    className="chatbot-podcast-link"
                    style={{ width: '100%', margin: 0 }}
                    onClick={() => handlePlay(podcast)}
                  >
                    ▶ Listen
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            type="text"
            placeholder="Type a message..."
            style={{ width: '90%', marginBottom: 10, padding: 8, borderRadius: 6, border: '1px solid #393e46', background: '#23272f', color: '#fff' }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            autoFocus
          />
          {!mood && (
            <>
              <div style={{ marginBottom: 12, fontWeight: 500 }}>How are you feeling today?</div>
              <div className="chatbot-mood-btns" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => { setOpen(false); setMood(null); navigate('/explore?category=TV%20%26%20Film'); }}>😊 Happy</button>
                <button onClick={() => { setOpen(false); setMood(null); navigate('/explore?category=Comedy'); }}>😢 Sad</button>
                <button onClick={() => { setOpen(false); setMood(null); navigate('/explore?category=Sports'); }}>💪 Motivated</button>
                {/* Add more moods as needed */}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBot;