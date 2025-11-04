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

// ====== Environment Setup ======
const { MONGODB_URI, JWT_SECRET, EMAIL_USER, EMAIL_PASS, PORT = 3000 } = process.env;

if (!MONGODB_URI || !JWT_SECRET) {
  console.error("❌ Missing required environment variables (MONGODB_URI, JWT_SECRET).");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// ====== Multer Setup (Profile Image Uploads) ======
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ====== Mongoose Setup ======
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ====== User Schema ======
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  likedPodcasts: { type: Array, default: [] },
  profileImage: Buffer,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('Profile', userSchema);

// ====== JWT Auth Middleware ======
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ====== Signup ======
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Missing required fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();

    // Optional Welcome Email
    if (EMAIL_USER && EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      });

      await transporter.sendMail({
        from: `"Podcast Library" <${EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to Podcast Library!',
        html: `
          <h2>Welcome to Podcast Library, ${name}!</h2>
          <p>Thank you for registering. Start exploring podcasts today!</p>
          <b>Happy listening!</b><br>The Podcast Library Team
        `,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ====== Login ======
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, name: user.name, email: user.email });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ====== Profile ======
app.get('/api/profile', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      name: user.name,
      email: user.email,
      likedPodcasts: user.likedPodcasts,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ====== Profile Image Upload ======
app.post('/api/profile/image', auth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  await User.updateOne({ email: req.user.email }, { $set: { profileImage: req.file.buffer } });
  res.json({ success: true });
});

app.get('/api/profile/image', auth, async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
  if (!user || !user.profileImage) return res.status(404).end();
  res.set('Content-Type', 'image/png');
  res.send(user.profileImage);
});

// ====== Podcast Like/Unlike ======
app.post('/api/like', auth, async (req, res) => {
  await User.updateOne(
    { email: req.user.email },
    { $addToSet: { likedPodcasts: req.body.podcast } }
  );
  res.json({ success: true });
});

app.put('/api/unlike', auth, async (req, res) => {
  const { podcastId } = req.body;
  await User.updateOne(
    { email: req.user.email },
    { $pull: { likedPodcasts: { id: podcastId } } }
  );
  res.json({ success: true });
});

app.post('/api/clear-likes', auth, async (req, res) => {
  await User.updateOne({ email: req.user.email }, { $set: { likedPodcasts: [] } });
  res.json({ success: true });
});

// ====== Podcast Search via iTunes ======
function mapItunesPodcastToFrontend(podcast) {
  return {
    id: podcast.collectionId,
    name: podcast.collectionName,
    images: [{ url: podcast.artworkUrl600 || podcast.artworkUrl100 }],
    publisher: podcast.artistName,
    description: podcast.collectionName + ' by ' + podcast.artistName,
    external_urls: { apple: podcast.collectionViewUrl },
    total_episodes: podcast.trackCount,
    feedUrl: podcast.feedUrl,
  };
}

app.get('/api/search', (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Missing query parameter' });

  const searchUrl = `https://itunes.apple.com/search?media=podcast&term=${encodeURIComponent(query)}&limit=10`;
  request.get({ url: searchUrl, json: true }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const mapped = (body.results || []).map(mapItunesPodcastToFrontend);
      res.json(mapped);
    } else {
      res.status(response?.statusCode || 500).json({ error: 'Failed to fetch podcasts' });
    }
  });
});

// ====== RSS Episode Fetcher ======
app.get('/api/episodes', async (req, res) => {
  const { feedUrl } = req.query;
  if (!feedUrl) return res.status(400).json({ error: 'Missing feedUrl parameter' });

  try {
    const parser = new Parser();
    const feed = await parser.parseURL(feedUrl);
    const episodes = (feed.items || [])
      .map(item => ({
        title: item.title,
        audioUrl: item.enclosure?.url || '',
        description: item.contentSnippet || item.summary || '',
        pubDate: item.pubDate || '',
        link: item.link || '',
      }))
      .filter(ep => ep.audioUrl);

    res.json(episodes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch or parse RSS feed', details: err.message });
  }
});

// ====== Start Server ======
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
