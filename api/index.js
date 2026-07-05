// Main API handler for Vercel serverless functions
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'ironport-learning-production-secret-2024';

// In-memory storage for demo (replace with database in production)
// For production, use Vercel Postgres, MongoDB Atlas, or similar
let users = [
  {
    id: '1',
    email: 'admin@ironport.local',
    password: '$2a$10$xQH8Qg3LX6P8YKZvF1QxC.Z4lx8ZF8YKZvF1QxC.Z4lx8ZF8YKZvF1', // admin123
    name: 'Administrator',
    role: 'admin'
  }
];

let progress = {};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      role: 'student'
    };

    users.push(user);

    // Initialize progress
    progress[user.id] = {
      userId: user.id,
      current: 0,
      checks: {},
      notes: {},
      quizAnswers: {},
      theme: 'dark',
      startDate: new Date(),
      lastSync: new Date()
    };

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });
});

// Get progress
app.get('/api/progress', authenticateToken, (req, res) => {
  let userProgress = progress[req.user.id];

  if (!userProgress) {
    // Create if doesn't exist
    userProgress = {
      userId: req.user.id,
      current: 0,
      checks: {},
      notes: {},
      quizAnswers: {},
      theme: 'dark',
      startDate: new Date(),
      lastSync: new Date()
    };
    progress[req.user.id] = userProgress;
  }

  res.json(userProgress);
});

// Sync progress
app.post('/api/progress/sync', authenticateToken, (req, res) => {
  try {
    const { current, checks, notes, quizAnswers, theme } = req.body;

    progress[req.user.id] = {
      userId: req.user.id,
      current,
      checks,
      notes,
      quizAnswers,
      theme,
      startDate: progress[req.user.id]?.startDate || new Date(),
      lastSync: new Date()
    };

    res.json(progress[req.user.id]);
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to sync progress' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', authenticateToken, (req, res) => {
  try {
    const leaderboard = users
      .filter(u => u.role === 'student')
      .map(user => {
        const userProgress = progress[user.id] || {};
        const checksCount = Object.values(userProgress.checks || {}).reduce((sum, arr) => sum + arr.length, 0);
        const quizCount = Object.values(userProgress.quizAnswers || {}).reduce((sum, obj) => sum + Object.keys(obj).length, 0);

        return {
          name: user.name,
          email: user.email,
          checksCompleted: checksCount,
          quizzesCompleted: quizCount,
          currentStage: userProgress.current || 0,
          daysActive: userProgress.startDate
            ? Math.ceil((new Date() - new Date(userProgress.startDate)) / (1000*60*60*24))
            : 0
        };
      })
      .sort((a, b) => b.checksCompleted - a.checksCompleted)
      .slice(0, 50);

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const userList = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      progress: progress[user.id] || {}
    }));

    res.json(userList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Export for Vercel
module.exports = app;
