# IronPort Learning Application - Complete Deployment Guide

## 📦 What's Included

This package contains three components:

1. **Enhanced Web Application** - Standalone HTML file with extended quizzes and features
2. **Backend API** - Node.js/Express server with multi-user support and authentication
3. **Mobile App** - Capacitor-based iOS/Android mobile application

---

## 🚀 Quick Start

### Option 1: Standalone (No Backend)

Just open `ironport-app-enhanced.html` in your browser. All features work offline.

### Option 2: With Backend (Multi-User)

See detailed instructions below.

---

## 📱 Mobile App Setup (Capacitor)

### Prerequisites

- Node.js 14+ installed
- Android Studio (for Android) or Xcode (for iOS)
- Capacitor CLI

### Installation Steps

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Create www directory and copy HTML
mkdir www
npm run copy

# Add platforms
npm run add:android  # For Android
npm run add:ios      # For iOS (Mac only)

# Sync changes
npm run sync

# Open in IDE
npm run android      # Opens Android Studio
npm run ios          # Opens Xcode (Mac only)
```

### Building for Production

**Android:**
```bash
cd mobile
npx cap build android
# APK will be in: android/app/build/outputs/apk/release/
```

**iOS:**
```bash
cd mobile
npx cap build ios
# Open Xcode and archive for App Store
```

### App Icons & Splash Screens

1. Generate icons using [Capacitor Assets](https://github.com/ionic-team/capacitor-assets)
2. Place in `mobile/resources/`
3. Run: `npx capacitor-assets generate`

---

## 🔧 Backend API Setup

### Prerequisites

- Node.js 14+
- SQLite (included) or PostgreSQL/MySQL (optional)

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env and set your JWT_SECRET
# nano .env  (or use any text editor)
```

### Starting the Server

**Development:**
```bash
npm run dev  # Uses nodemon for auto-reload
```

**Production:**
```bash
npm start
```

The server will run on `http://localhost:3000`

### Default Admin Account

After first run, you can login with:
- Email: `admin@ironport.local`
- Password: `admin123`

**⚠️ IMPORTANT: Change this password immediately in production!**

### Database

By default, the backend uses SQLite (file: `backend/database.sqlite`).

To use PostgreSQL or MySQL, install the appropriate driver and update the Sequelize configuration in `server.js`.

---

## 🌐 Connecting Frontend to Backend

### Update API URL

Edit `ironport-app-enhanced.html` and find this line:

```javascript
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://your-backend-url.com/api';
```

Replace `your-backend-url.com` with your actual backend domain.

### Enable Multi-User Features

The enhanced app includes:
- User registration/login
- Progress sync across devices
- Leaderboard
- Admin dashboard

These features only work when connected to the backend.

---

## 📊 Backend API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Progress

- `GET /api/progress` - Get user progress
- `POST /api/progress/sync` - Sync progress

### Admin

- `GET /api/admin/users` - List all users (admin only)

### Other

- `GET /api/leaderboard` - Get leaderboard
- `GET /api/health` - Health check

### Example Usage

```javascript
// Register
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  })
});
const { token, user } = await response.json();

// Use token for authenticated requests
const progress = await fetch('http://localhost:3000/api/progress', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🔐 Security Considerations

### For Production:

1. **Change JWT_SECRET** in `.env` to a strong random string
2. **Use HTTPS** for both frontend and backend
3. **Enable rate limiting** (install `express-rate-limit`)
4. **Add helmet** for security headers: `npm install helmet`
5. **Use environment variables** for sensitive data
6. **Enable CORS** only for your domain
7. **Regular security updates**: `npm audit fix`

### Recommended Additions:

```bash
npm install helmet express-rate-limit
```

Update `server.js`:
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

---

## 🌍 Deployment Options

### Backend Deployment

**Option 1: Heroku**
```bash
cd backend
heroku create ironport-learning-api
git push heroku main
```

**Option 2: DigitalOcean/AWS/Azure**
- Use PM2 for process management
- Set up nginx as reverse proxy
- Enable SSL with Let's Encrypt

**Option 3: Vercel/Netlify Functions**
- Convert to serverless functions
- Use PostgreSQL/MySQL instead of SQLite

### Frontend Deployment

**Option 1: GitHub Pages**
```bash
# Just commit ironport-app-enhanced.html
# Enable GitHub Pages in repo settings
```

**Option 2: Netlify**
- Drag & drop the HTML file
- Or connect to GitHub repo

**Option 3: Vercel**
```bash
vercel --prod
```

### Mobile App Deployment

**Android (Google Play):**
1. Build signed APK/AAB
2. Create Play Console account
3. Upload and publish

**iOS (App Store):**
1. Enroll in Apple Developer Program
2. Archive in Xcode
3. Upload via App Store Connect

---

## 📈 Enhanced Features

### New Quiz Questions

Each stage now has **5-6 quiz questions** (up from 2-3):

- **Stage 1 (DNS)**: 6 questions
- **Stage 2 (Address Worlds)**: 5 questions
- More questions added to all other stages

Total: **50+ quiz questions** across all stages

### Multi-User Features

- User registration and authentication
- Progress sync across devices
- Leaderboard showing top learners
- Admin dashboard to monitor all users
- Secure JWT-based authentication

### Mobile-Specific Features

- Offline support (with service worker)
- Native splash screen
- Status bar customization
- Keyboard handling
- Haptic feedback (optional)

---

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Test health endpoint
curl http://localhost:3000/api/health

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Mobile Testing

```bash
cd mobile

# Test on Android emulator
npx cap run android

# Test on iOS simulator (Mac only)
npx cap run ios
```

---

## 📚 Directory Structure

```
Cisco Ironport/
├── ironport-learning-app.html          # Original app
├── ironport-app-enhanced.html          # Enhanced version with more quizzes
├── DEPLOYMENT.md                        # This file
├── backend/
│   ├── server.js                       # Express server
│   ├── package.json
│   ├── .env.example                    # Environment variables template
│   └── database.sqlite                 # SQLite database (auto-created)
└── mobile/
    ├── capacitor.config.json           # Capacitor configuration
    ├── package.json
    └── www/
        └── index.html                  # Copied from enhanced HTML
```

---

## 🆘 Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Run `npm install` again
- Check Node.js version (14+)

### Mobile app won't build
- Run `npx cap doctor` to check setup
- Ensure Android Studio/Xcode is installed
- Run `npx cap sync` after changes

### Can't connect to backend from mobile
- Update `API_URL` in the HTML file
- Check CORS settings in backend
- Use your computer's IP (not localhost) for testing

### Database errors
- Delete `database.sqlite` and restart server
- Check write permissions in backend folder

---

## 🎓 Next Steps

1. Customize the enhanced app with your organization's branding
2. Add more quiz questions for specific topics
3. Integrate with existing LMS (if applicable)
4. Add analytics tracking
5. Implement push notifications for mobile app
6. Add social features (sharing progress, commenting)

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Open an issue on GitHub (if applicable)

---

## 🔄 Updates & Maintenance

### Updating Dependencies

```bash
# Backend
cd backend && npm update

# Mobile
cd mobile && npm update
```

### Database Migrations

For schema changes, consider using Sequelize migrations:

```bash
npx sequelize-cli init
npx sequelize-cli migration:generate --name add-new-field
```

---

## ✅ Checklist Before Going Live

- [ ] Changed default admin password
- [ ] Set strong JWT_SECRET in production
- [ ] Enabled HTTPS
- [ ] Added rate limiting
- [ ] Configured CORS properly
- [ ] Set up database backups
- [ ] Added monitoring/logging
- [ ] Tested on multiple devices
- [ ] Optimized images and assets
- [ ] Added error tracking (Sentry, etc.)

---

**Good luck with your IronPort Learning deployment! 🚀**
