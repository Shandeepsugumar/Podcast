import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const mongoUri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
app.use(cors());
app.use(express.json());

// Mongoose User Schema & Model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  likedPodcasts: { type: Array, default: [] }
});
const User = mongoose.model('Profile', userSchema);

// Connect to MongoDB Atlas with Mongoose
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});