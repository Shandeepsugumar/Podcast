import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Password strength checker: returns 'weak', 'medium', or 'strong'
const getPasswordStrength = (password) => {
  if (!password) return '';
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  if (password.length >= 8 && hasLetter && hasNumber && hasSpecial) {
    return 'strong';
  } else if (password.length >= 6 && ((hasLetter && hasNumber) || (hasLetter && hasSpecial) || (hasNumber && hasSpecial))) {
    return 'medium';
  } else {
    return 'weak';
  }
};

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'password') {
      setPasswordStrength(getPasswordStrength(e.target.value));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (getPasswordStrength(form.password) !== 'strong') {
      setMsg('Password is weak. Use at least 8 characters, including a letter, a number, and a special character.');
      return;
    }
    const res = await fetch('https://podcast-0wqi.onrender.com/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (data.success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/login');
      }, 2000);
    } else {
      setMsg(data.error);
    }
  };

  return (
    <div className="auth-container">
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            color: '#2e7d32',
            padding: '2.5rem 3.5rem',
            borderRadius: '18px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            fontSize: '1.15rem',
            fontWeight: 'bold',
            textAlign: 'center',
            border: '2px solid #43a047',
            animation: 'popIn 0.3s cubic-bezier(.68,-0.55,.27,1.55)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>🎉 Welcome to Podcast Library!</div>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>
              Your registration was successful.<br/>
              <span style={{ color: '#388e3c', fontWeight: 700 }}>A welcome email has been sent to your inbox.</span>
            </div>
            <div style={{ margin: '18px 0', color: '#333', fontWeight: 500, fontSize: '1.05rem' }}>
              <ul style={{ textAlign: 'left', margin: '0 auto', maxWidth: 350, paddingLeft: 20 }}>
                <li>🔎 <b>Discover</b> trending and new podcasts</li>
                <li>❤️ <b>Like</b> and save your favorite episodes</li>
                <li>📝 <b>Create</b> your own playlists</li>
                <li>🎧 <b>Listen</b> anytime, anywhere</li>
                <li>🌙 <b>Dark mode</b> for night listening</li>
                <li>🔔 <b>Get notified</b> about new releases</li>
              </ul>
            </div>
            <div style={{ color: '#388e3c', fontWeight: 600, fontSize: '1.1rem', marginBottom: 6 }}>
              Enjoy exploring the world of podcasts with us!
            </div>
            <div style={{ color: '#888', fontSize: '0.98rem' }}>
              Redirecting to login...
            </div>
          </div>
        </div>
      )}
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {form.password && (
          <div style={{ marginBottom: 8 }}>
            {/* Password strength bars */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
              <div style={{
                height: 7,
                width: 60,
                borderRadius: 5,
                background: passwordStrength === 'weak' ? '#f44336' : passwordStrength === 'medium' ? '#ffd600' : passwordStrength === 'strong' ? '#43a047' : '#e0e0e0',
                transition: 'background 0.3s'
              }} />
              <div style={{
                height: 7,
                width: 60,
                borderRadius: 5,
                background: passwordStrength === 'strong' ? '#43a047' : passwordStrength === 'medium' ? '#ffd600' : '#e0e0e0',
                transition: 'background 0.3s'
              }} />
              <div style={{
                height: 7,
                width: 60,
                borderRadius: 5,
                background: passwordStrength === 'strong' ? '#43a047' : '#e0e0e0',
                transition: 'background 0.3s'
              }} />
            </div>
            {/* Password strength label */}
            <div style={{
              color: passwordStrength === 'strong' ? '#43a047' : passwordStrength === 'medium' ? '#ffd600' : '#f44336',
              fontSize: '0.95rem',
              fontWeight: 500,
              textTransform: 'capitalize',
              marginTop: 2
            }}>
              {passwordStrength && `Password is ${passwordStrength}`}
            </div>
          </div>
        )}
        <button type="submit">Sign Up</button>
        <div>{msg}</div>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Signup; 