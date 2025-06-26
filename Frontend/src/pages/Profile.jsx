import React, { useEffect, useState } from 'react';
import { useUser } from '../UserContext';

const Profile = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [user]);

  if (!user) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Please log in to view your profile.</div>;
  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Loading profile...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', color: '#fff', background: 'rgba(0,0,0,0.5)', borderRadius: 16, padding: 32 }}>
      <h1>Profile</h1>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <h2>Liked Podcasts</h2>
      {profile.likedPodcasts && profile.likedPodcasts.length > 0 ? (
        <ul>
          {profile.likedPodcasts.map((pod, idx) => (
            <li key={idx}>{pod.title || pod.name}</li>
          ))}
        </ul>
      ) : (
        <p>No liked podcasts yet.</p>
      )}
    </div>
  );
};

export default Profile; 