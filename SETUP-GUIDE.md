# 🚀 Quick Setup Guide

## Choose Your Setup

### Option 1: Simple Standalone (Recommended for Quick Start)
**No installation required** - Just open the file!

1. Open `ironport-app-enhanced.html` in any modern browser
2. Start learning immediately
3. Your progress is saved automatically in your browser

**Pros:**
- ✅ Zero setup
- ✅ Works offline
- ✅ No dependencies

**Cons:**
- ❌ No multi-user support
- ❌ Progress tied to one browser
- ❌ No leaderboard

---

### Option 2: With Backend (Recommended for Teams)
**Full-featured with multi-user support**

#### Step 1: Install Node.js
Download from https://nodejs.org (LTS version recommended)

#### Step 2: Setup Backend
```bash
# Open terminal/command prompt
cd "C:\Users\stasak\OneDrive - Bynet Data Communications Ltd\שולחן העבודה\Cisco Ironport\backend"

# Install dependencies
npm install

# Start server
npm start
```

You should see: `🚀 IronPort Learning Backend running on port 3000`

#### Step 3: Open the App
Open `ironport-app-enhanced.html` in your browser

#### Step 4: Create Account
Click "Register" and create your account

**Pros:**
- ✅ Multi-user support
- ✅ Progress sync across devices
- ✅ Leaderboard
- ✅ Admin dashboard

**Cons:**
- ❌ Requires Node.js installation
- ❌ Backend server must be running

---

### Option 3: Mobile App (Advanced)
**Native iOS/Android apps**

#### Prerequisites:
- Android Studio (for Android)
- Xcode (for iOS, Mac only)
- Node.js installed

#### Setup:
```bash
cd mobile
npm install
npm run copy
npm run add:android  # or add:ios
npm run android      # or ios
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 🆘 Troubleshooting

### "Backend is not responding"
1. Make sure Node.js is installed: `node --version`
2. Make sure backend is running: `cd backend && npm start`
3. Check if port 3000 is free
4. Try: `http://localhost:3000/api/health` in browser

### "Progress not saving"
1. Check browser console for errors (F12)
2. Make sure localStorage is enabled
3. Try a different browser
4. Clear browser cache and retry

### "Mobile app won't build"
1. Run `npx cap doctor` to check setup
2. Make sure Android Studio/Xcode is installed
3. Run `npx cap sync` after making changes

---

## 🎯 Quick Commands Reference

### Backend
```bash
# Start backend
cd backend
npm start

# Start with auto-reload (development)
npm run dev

# Check health
curl http://localhost:3000/api/health
```

### Mobile
```bash
# Build and sync
cd mobile
npm run build

# Open in IDE
npm run android
npm run ios
```

---

## 📞 Need More Help?

1. Read the full [DEPLOYMENT.md](DEPLOYMENT.md)
2. Read the [README.md](README.md) for features
3. Check code comments in the files
4. Contact your system administrator

---

**Ready to start learning IronPort? Open the app and begin! 🎓**
