// Leaderboard Backend (Node.js + Express + MongoDB)
// --------------------------------------------------
// This server manages users, point claims, and leaderboard logic.
// It uses MongoDB (via Mongoose) for persistent storage.
//
// Features:
// - User management (add, list, seed default users)
// - Claim random points for users
// - Claim history tracking
// - Real-time leaderboard (sorted by points)
//
// Author: [Your Name]
// --------------------------------------------------

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ClaimHistory = require('./models/ClaimHistory');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// ----------------------
// MongoDB Connection
// ----------------------
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// ----------------------
// Seed Default Users
// ----------------------
/**
 * Seed the database with 10 default users if empty.
 */
const seedUsers = async () => {
  const count = await User.countDocuments();
  if (count === 0) {
    const defaultUsers = [
      { name: 'Vidhi', points: 50 },
      { name: 'Kamal', points: 15 },
      { name: 'Sanak', points: 10 },
      { name: 'Neha', points: 4 },
      { name: 'Vishal', points: 2 },
      { name: 'Rohit', points: 0 },
      { name: 'Amit', points: 0 },
      { name: 'Priya', points: 0 },
      { name: 'Riya', points: 0 },
      { name: 'Jay', points: 10 }
    ];
    await User.insertMany(defaultUsers);
    console.log('Seeded default users');
  }
};

mongoose.connection.once('open', () => {
  seedUsers();
});

// ----------------------
// API Routes
// ----------------------

/**
 * GET /users
 * Get all users, sorted by total points (descending).
 * Returns: [{ _id, name, points, ... }]
 */
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ points: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * POST /users
 * Add a new user (no limit). Name must be unique.
 * Body: { name: string }
 * Returns: created user object or error.
 */
app.post('/users', async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const existingUser = await User.findOne({ name: name.trim() });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this name already exists' });
    }
    const newUser = new User({ name: name.trim(), points: 0 });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

/**
 * POST /users/:id/claim
 * Claim random points (1-10) for a user by ID.
 * Updates user's total points and creates a claim history entry.
 * Returns: { name, claimed, points, _id }
 */
app.post('/users/:id/claim', async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
    // Generate random points (1-10)
    const points = Math.floor(Math.random() * 10) + 1;
  user.points += points;
    await user.save();
    // Log claim in history
    const newClaim = new ClaimHistory({
      userId: user._id,
    name: user.name,
    points,
    timestamp: new Date().toISOString(),
    });
    await newClaim.save();
    // Keep only last 50 claim history entries
    const history = await ClaimHistory.find().sort({ timestamp: -1 });
    if (history.length > 50) {
      await ClaimHistory.deleteMany({ _id: { $in: history.slice(50).map(h => h._id) } });
    }
    res.json({ name: user.name, claimed: points, points: user.points, _id: user._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to claim points' });
  }
});

/**
 * GET /history
 * Get claim history (most recent first).
 * Returns: [{ userId, name, points, timestamp }]
 */
app.get('/history', async (req, res) => {
  try {
    const history = await ClaimHistory.find().sort({ timestamp: -1 });
  res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ----------------------
// Start Server
// ----------------------
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
}); 