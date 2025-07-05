import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '../UserContext';

const getAvatarUrl = (nameOrEmail) => {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameOrEmail)}`;
};

const Profile = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImgUrl, setProfileImgUrl] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    if (!user) return;
    fetch(`https://podcast-0wqi.onrender.com/api/profile?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
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

  if (!user) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Please log in to view your profile.</div>;
  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Loading profile...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', color: '#fff', background: 'rgba(0,0,0,0.5)', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px #0006' }}>
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
          <h1 style={{ margin: 0 }}>{profile.name}</h1>
          <p style={{ color: '#ccc', margin: '8px 0 0 0' }}>{profile.email}</p>
        </div>
      </div>
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
  );
};

export default Profile; 