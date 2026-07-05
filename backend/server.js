const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup (SQLite for simplicity, can be changed to PostgreSQL/MySQL)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// Models
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('student', 'instructor', 'admin'),
    defaultValue: 'student'
  }
});

const Progress = sequelize.define('Progress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  current: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  checks: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  notes: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  quizAnswers: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  theme: {
    type: DataTypes.STRING,
    defaultValue: 'dark'
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastSync: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Associations
User.hasOne(Progress, { foreignKey: 'userId' });
Progress.belongsTo(User, { foreignKey: 'userId' });

// Authentication Middleware
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
  res.json({ status: 'OK', timestamp: new Date() });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0]
    });

    // Create initial progress
    await Progress.create({
      userId: user.id
    });

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
    const user = await User.findOne({ where: { email } });
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
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'name', 'role', 'createdAt']
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get progress
app.get('/api/progress', authenticateToken, async (req, res) => {
  try {
    let progress = await Progress.findOne({ where: { userId: req.user.id } });

    if (!progress) {
      // Create if doesn't exist
      progress = await Progress.create({ userId: req.user.id });
    }

    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Update progress (sync)
app.post('/api/progress/sync', authenticateToken, async (req, res) => {
  try {
    const { current, checks, notes, quizAnswers, theme } = req.body;

    let progress = await Progress.findOne({ where: { userId: req.user.id } });

    if (!progress) {
      progress = await Progress.create({
        userId: req.user.id,
        current,
        checks,
        notes,
        quizAnswers,
        theme,
        lastSync: new Date()
      });
    } else {
      await progress.update({
        current,
        checks,
        notes,
        quizAnswers,
        theme,
        lastSync: new Date()
      });
    }

    res.json(progress);
  } catch (error) {
    console.error('Sync progress error:', error);
    res.status(500).json({ error: 'Failed to sync progress' });
  }
});

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'role', 'createdAt'],
      include: [{
        model: Progress,
        attributes: ['current', 'lastSync', 'startDate']
      }]
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email'],
      include: [{
        model: Progress,
        attributes: ['current', 'checks', 'quizAnswers', 'startDate']
      }],
      limit: 50
    });

    // Calculate scores
    const leaderboard = users.map(user => {
      const progress = user.Progress || {};
      const checksCount = Object.values(progress.checks || {}).reduce((sum, arr) => sum + arr.length, 0);
      const quizCount = Object.values(progress.quizAnswers || {}).reduce((sum, obj) => sum + Object.keys(obj).length, 0);

      return {
        name: user.name,
        email: user.email,
        checksCompleted: checksCount,
        quizzesCompleted: quizCount,
        currentStage: progress.current || 0,
        daysActive: progress.startDate
          ? Math.ceil((new Date() - new Date(progress.startDate)) / (1000*60*60*24))
          : 0
      };
    }).sort((a, b) => b.checksCompleted - a.checksCompleted);

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Initialize database and start server
sequelize.sync({ force: false }).then(async () => {
  console.log('Database synced');

  // Create default admin if doesn't exist
  const adminEmail = 'admin@ironport.local';
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin'
    });
    console.log('Default admin created: admin@ironport.local / admin123');
  }

  app.listen(PORT, () => {
    console.log(`🚀 IronPort Learning Backend running on port ${PORT}`);
    console.log(`📊 API URL: http://localhost:${PORT}/api`);
  });
});
