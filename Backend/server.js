import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'request';
import Parser from 'rss-parser';
import multer from 'multer';
import nodemailer from 'nodemailer';

const mongoUri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
app.use(cors());
app.use(express.json());

// Multer configuration for profile image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Mongoose User Schema & Model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  likedPodcasts: { type: Array, default: [] },
  profileImage: Buffer // Add profile image as binary
});
const User = mongoose.model('Profile', userSchema);

// Connect to MongoDB Atlas with Mongoose
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB Atlas (Mongoose)'))
  .catch(err => console.error(err));

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  console.log('Signup body:', req.body);
  if (!req.body || !req.body.name || !req.body.email || !req.body.password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed, likedPodcasts: [] });
  await user.save();

  // Send welcome email
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // set in your environment variables
        pass: process.env.EMAIL_PASS  // set in your environment variables
      }
    });
    await transporter.sendMail({
      from: `"Podcast Library" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Podcast Library!',
      html: `<h2>Welcome to Podcast Library, ${name}!</h2>
        <p>Thank you for registering. We're excited to have you join our community of podcast lovers.</p>
        <p>Explore, listen, and enjoy a world of podcasts. If you have any questions, feel free to reply to this email.</p>
        <br>
        <b>Happy listening!</b><br>
        The Podcast Library Team`
    });
  } catch (err) {
    console.error('Error sending welcome email:', err);
    // Don't block registration if email fails
  }

  res.json({ success: true });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, name: user.name, email: user.email });
});

// Middleware to verify JWT
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Get profile (public, by email)
app.get('/api/profile', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ name: user.name, email: user.email, likedPodcasts: user.likedPodcasts || [] });
});

// Get liked podcasts (public, by email)
app.get('/api/liked', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  const user = await User.findOne({ email });
  res.json(user?.likedPodcasts || []);
});

// Like a podcast
app.post('/api/like', auth, async (req, res) => {
  const { podcast } = req.body;
  await User.updateOne(
    { email: req.user.email },
    { $addToSet: { likedPodcasts: podcast } }
  );
  res.json({ success: true });
});

// Unlike a podcast
app.put('/api/unlike', async (req, res) => {
  const { email, podcastId } = req.body;
  if (!email || !podcastId) return res.status(400).json({ error: 'Missing email or podcastId' });
  await User.updateOne(
    { email },
    { $pull: { likedPodcasts: { id: podcastId } } }
  );
  res.json({ success: true });
});

// Clear all liked podcasts for the logged-in user
app.post('/api/clear-likes', auth, async (req, res) => {
  await User.updateOne(
    { email: req.user.email },
    { $set: { likedPodcasts: [] } }
  );
  res.json({ success: true });
});

// Upload or update profile image
app.post('/api/profile/image', auth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  await User.updateOne(
    { email: req.user.email },
    { $set: { profileImage: req.file.buffer } }
  );
  res.json({ success: true });
});
// Serve profile image
app.get('/api/profile/image', auth, async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
  if (!user || !user.profileImage) return res.status(404).end();
  res.set('Content-Type', 'image/png');
  res.send(user.profileImage);
});

// Helper to map iTunes podcast to frontend's expected structure
function mapItunesPodcastToFrontend(podcast) {
  return {
    id: podcast.collectionId,
    name: podcast.collectionName,
    images: [{ url: podcast.artworkUrl600 || podcast.artworkUrl100 }],
    publisher: podcast.artistName,
    description: podcast.collectionName + ' by ' + podcast.artistName, // iTunes search doesn't return description
    external_urls: { apple: podcast.collectionViewUrl },
    total_episodes: podcast.trackCount,
    feedUrl: podcast.feedUrl,
    // Add more fields as needed
  };
}

// Search podcasts using iTunes Search API
app.get('/api/search', function(req, res) {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter.' });
  }
  const searchUrl = `https://itunes.apple.com/search?media=podcast&term=${encodeURIComponent(query)}&limit=10`;
  request.get({
    url: searchUrl,
    json: true
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      // iTunes returns results in body.results
      const mapped = (body.results || []).map(mapItunesPodcastToFrontend);
      res.json(mapped);
    } else {
      res.status(response ? response.statusCode : 500).json({ error: 'Failed to fetch podcasts', details: body });
    }
  });
});

// Fetch podcast details by collectionId (show id)
app.get('/api/show', function(req, res) {
  const showId = req.query.id;
  if (!showId) {
    return res.status(400).json({ error: 'Missing show id.' });
  }
  // Lookup podcast details by collectionId
  const lookupUrl = `https://itunes.apple.com/lookup?id=${encodeURIComponent(showId)}`;
  request.get({
    url: lookupUrl,
    json: true
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const mapped = (body.results && body.results.length > 0) ? mapItunesPodcastToFrontend(body.results[0]) : {};
      res.json(mapped);
    } else {
      res.status(response ? response.statusCode : 500).json({ error: 'Failed to fetch show', details: body });
    }
  });
});

// New endpoint: Fetch episodes from RSS feed
app.get('/api/episodes', async function(req, res) {
  const feedUrl = req.query.feedUrl;
  if (!feedUrl) {
    return res.status(400).json({ error: 'Missing feedUrl parameter.' });
  }
  try {
    const parser = new Parser();
    const feed = await parser.parseURL(feedUrl);
    const episodes = (feed.items || []).map(item => ({
      title: item.title,
      audioUrl: item.enclosure?.url || '',
      description: item.contentSnippet || item.summary || '',
      pubDate: item.pubDate || '',
      link: item.link || '',
    })).filter(ep => ep.audioUrl);
    res.json(episodes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch or parse RSS feed', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});