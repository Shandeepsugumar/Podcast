import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '../UserContext';

const getAvatarUrl = (nameOrEmail) => {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameOrEmail)}`;
};

const Profile = () => {
  const { user, logout } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImgUrl, setProfileImgUrl] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (!user) return;
    fetch(`https://podcast-0wqi.onrender.com/api/profile?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setNewName(data.name || '');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch profile');
        setLoading(false);
      });
    // Fetch profile image if logged in
    const fetchProfileImg = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('https://podcast-0wqi.onrender.com/api/profile/image', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        setProfileImgUrl(URL.createObjectURL(blob));
      } else {
        setProfileImgUrl(null);
      }
    };
    fetchProfileImg();
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('token');
    const res = await fetch('https://podcast-0wqi.onrender.com/api/profile/image', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (res.ok) {
      // Refresh the profile image
      const imgRes = await fetch('https://podcast-0wqi.onrender.com/api/profile/image', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (imgRes.ok) {
        const blob = await imgRes.blob();
        setProfileImgUrl(URL.createObjectURL(blob));
      }
    }
  };

  const handleNameEdit = () => setEditingName(true);
  const handleNameCancel = () => {
    setEditingName(false);
    setNewName(profile.name || '');
  };
  const handleNameSave = async () => {
    setSavingName(true);
    const token = localStorage.getItem('token');
    const res = await fetch('https://podcast-0wqi.onrender.com/api/profile/name', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newName })
    });
    if (res.ok) {
      setProfile({ ...profile, name: newName });
      setEditingName(false);
    }
    setSavingName(false);
  };

  if (!user) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Please log in to view your profile.</div>;
  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Loading profile...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;
  if (!profile) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Profile data is not available.</div>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
      <div style={{ maxWidth: 800, width: '100%', color: '#fff', background: 'rgba(0,0,0,0.5)', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px #0006' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 32 }}>
          <div style={{ position: 'relative' }}>
            <img
              src={profileImgUrl || getAvatarUrl(profile.name || profile.email)}
              alt="Profile"
              style={{ width: 100, height: 100, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 8px #0004', objectFit: 'cover' }}
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <button
              style={{ position: 'absolute', bottom: 0, right: 0, background: '#4db8ff', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 18, boxShadow: '0 2px 8px #0004', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => fileInputRef.current.click()}
              title="Change profile picture"
            >
              ✎
            </button>
          </div>
          <div>
            {editingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  style={{ fontSize: 22, padding: '2px 8px', borderRadius: 6, border: '1px solid #aaa', marginRight: 4 }}
                  disabled={savingName}
                />
                <button onClick={handleNameSave} disabled={savingName} style={{ background: '#4db8ff', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontWeight: 500 }}>Save</button>
                <button onClick={handleNameCancel} disabled={savingName} style={{ background: '#888', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
              </div>
            ) : (
              <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                {profile.name}
                <button onClick={handleNameEdit} style={{ background: 'none', border: 'none', color: '#4db8ff', cursor: 'pointer', fontSize: 18, marginLeft: 4 }} title="Edit name">✎</button>
              </h1>
            )}
            <p style={{ color: '#ccc', margin: '8px 0 0 0' }}>{profile.email}</p>
            <p style={{ color: '#aaa', margin: '4px 0 0 0', fontSize: 14 }}>Account created: {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ marginTop: 0 }}>Liked Podcasts</h2>
            {profile.likedPodcasts && profile.likedPodcasts.length > 0 ? (
              <ul style={{ paddingLeft: 20 }}>
                {profile.likedPodcasts.map((pod, idx) => (
                  <li key={idx} style={{ marginBottom: 8 }}>{pod.title || pod.name}</li>
                ))}
              </ul>
            ) : (
              <p>No liked podcasts yet.</p>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ marginTop: 0 }}>Profile Stats</h2>
            <ul style={{ paddingLeft: 20, listStyle: 'none', color: '#ffd700', fontWeight: 500 }}>
              <li>Total Likes: {profile.likedPodcasts ? profile.likedPodcasts.length : 0}</li>
              <li>Email Verified: {profile.emailVerified ? 'Yes' : 'No'}</li>
              <li>Account Type: {profile.accountType || 'Standard'}</li>
            </ul>
          </div>
        </div>
        <button onClick={logout} style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontSize: 16, cursor: 'pointer', fontWeight: 600, marginTop: 12, boxShadow: '0 2px 8px #0004' }}>Logout</button>
      </div>
    </div>
  );
};

export default Profile; 