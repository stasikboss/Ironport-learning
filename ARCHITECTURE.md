# 🏗️ IronPort Learning Platform - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    IronPort Learning Platform                    │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │   CLIENT LAYER      │
                    └─────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Web Browser  │    │ iOS App      │    │ Android App  │
│ (HTML/CSS/JS)│    │ (Capacitor)  │    │ (Capacitor)  │
└──────────────┘    └──────────────┘    └──────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌─────────────────────┐
                    │  API LAYER (REST)   │
                    │   JWT Auth          │
                    └─────────────────────┘
                             │
                    ┌─────────────────────┐
                    │  BACKEND LAYER      │
                    │  Express.js         │
                    │  Node.js            │
                    └─────────────────────┘
                             │
                    ┌─────────────────────┐
                    │  DATA LAYER         │
                    │  Sequelize ORM      │
                    └─────────────────────┘
                             │
                    ┌─────────────────────┐
                    │  STORAGE            │
                    │  SQLite/PostgreSQL  │
                    └─────────────────────┘
```

---

## Component Details

### 1. Client Layer

#### Web Browser
```
Technology: Pure HTML5/CSS3/JavaScript
Features:
  - Responsive design (mobile-first)
  - RTL support (Hebrew)
  - LocalStorage for offline
  - Theme switching (dark/light)
  - Print optimization

File: ironport-app-enhanced.html (single file)
```

#### Mobile Apps
```
Framework: Capacitor 5.x
Platforms: iOS (Swift) + Android (Kotlin)
Features:
  - Native UI components
  - Offline-first architecture
  - Background sync
  - Push notifications (optional)
  - Biometric auth (optional)

Directory: mobile/
```

---

### 2. API Layer

#### Authentication Flow
```
┌──────────┐                                    ┌──────────┐
│  Client  │                                    │  Server  │
└──────────┘                                    └──────────┘
     │                                               │
     │  POST /api/auth/register                     │
     │  { email, password, name }                   │
     ├──────────────────────────────────────────────>│
     │                                               │
     │                                        ┌──────▼──────┐
     │                                        │ Hash password│
     │                                        │ Create user  │
     │                                        │ Generate JWT │
     │                                        └──────┬──────┘
     │                                               │
     │  { token, user }                             │
     │<──────────────────────────────────────────────┤
     │                                               │
     │  GET /api/progress                           │
     │  Header: Authorization: Bearer <token>       │
     ├──────────────────────────────────────────────>│
     │                                               │
     │                                        ┌──────▼──────┐
     │                                        │ Verify JWT   │
     │                                        │ Get progress │
     │                                        └──────┬──────┘
     │                                               │
     │  { current, checks, notes, ... }             │
     │<──────────────────────────────────────────────┤
     │                                               │
```

#### API Endpoints Map
```
Public Endpoints (No Auth):
  ├── GET  /api/health              → Health check
  ├── POST /api/auth/register       → User registration
  └── POST /api/auth/login          → User login

Protected Endpoints (JWT Required):
  ├── GET  /api/auth/me             → Current user info
  ├── GET  /api/progress            → Get user progress
  ├── POST /api/progress/sync       → Sync progress
  └── GET  /api/leaderboard         → Get leaderboard

Admin Only (Role-Based):
  └── GET  /api/admin/users         → List all users
```

---

### 3. Backend Layer

#### Express.js Server Architecture
```
server.js
  ├── Middleware
  │   ├── CORS (cross-origin)
  │   ├── JSON body parser
  │   └── Error handler
  │
  ├── Models (Sequelize)
  │   ├── User
  │   │   ├── id (UUID)
  │   │   ├── email (unique)
  │   │   ├── password (hashed)
  │   │   ├── name
  │   │   └── role (enum)
  │   │
  │   └── Progress
  │       ├── id (UUID)
  │       ├── userId (FK → User)
  │       ├── current (stage number)
  │       ├── checks (JSON)
  │       ├── notes (JSON)
  │       ├── quizAnswers (JSON)
  │       └── lastSync (timestamp)
  │
  ├── Routes
  │   ├── /api/auth/*        → Authentication
  │   ├── /api/progress/*    → Progress management
  │   └── /api/admin/*       → Admin operations
  │
  └── Authentication
      ├── JWT generation
      ├── Token verification
      └── Password hashing (bcrypt)
```

#### Security Layers
```
┌─────────────────────────────────────┐
│  1. HTTPS/TLS Encryption            │  ← Transport security
├─────────────────────────────────────┤
│  2. CORS Configuration              │  ← Origin validation
├─────────────────────────────────────┤
│  3. JWT Verification                │  ← Authentication
├─────────────────────────────────────┤
│  4. Role-Based Access Control       │  ← Authorization
├─────────────────────────────────────┤
│  5. SQL Injection Protection (ORM)  │  ← Data security
├─────────────────────────────────────┤
│  6. Password Hashing (bcrypt)       │  ← Credential security
├─────────────────────────────────────┤
│  7. Rate Limiting (optional)        │  ← DDoS protection
└─────────────────────────────────────┘
```

---

### 4. Data Layer

#### Database Schema
```sql
┌──────────────────────────────────────┐
│ Users                                │
├──────────────────────────────────────┤
│ id               UUID PK              │
│ email            VARCHAR UNIQUE       │
│ password         VARCHAR              │  (bcrypt hash)
│ name             VARCHAR              │
│ role             ENUM                 │  (student/instructor/admin)
│ createdAt        TIMESTAMP            │
│ updatedAt        TIMESTAMP            │
└──────────────────────────────────────┘
                   │
                   │ 1:1
                   │
┌──────────────────▼───────────────────┐
│ Progress                             │
├──────────────────────────────────────┤
│ id               UUID PK              │
│ userId           UUID FK              │
│ current          INTEGER              │  (0-11)
│ checks           JSON                 │  {stageId: [0,1,2]}
│ notes            JSON                 │  {stageId: "text"}
│ quizAnswers      JSON                 │  {stageId: {qIdx: answer}}
│ theme            VARCHAR              │  (dark/light)
│ startDate        TIMESTAMP            │
│ lastSync         TIMESTAMP            │
└──────────────────────────────────────┘
```

#### Data Flow
```
Client Action → API Request → Backend Processing → Database Update
     │              │              │                      │
     │              │              │                      │
User clicks   →  POST /sync  →  Validate JWT  →   UPDATE Progress
"sync"            with data      Extract userId      WHERE userId=X
                                  Update record
                                      │
                                      ▼
                               Return updated
                                  progress
                                      │
                                      ▼
                               Client updates
                                    UI
```

---

## Deployment Architectures

### Option 1: Simple Standalone
```
┌─────────────────────┐
│   User's Browser    │
│                     │
│  HTML + CSS + JS    │
│  (Self-contained)   │
│                     │
│  LocalStorage       │
│  (Offline data)     │
└─────────────────────┘

Pros: Zero setup, works offline
Cons: No multi-user, no sync
```

### Option 2: Client-Server
```
┌──────────────┐         HTTPS          ┌──────────────┐
│  Web Client  │◄─────────────────────► │  Backend     │
│  (Browser)   │    JWT Auth            │  (Node.js)   │
└──────────────┘                         └──────┬───────┘
                                                │
                                         ┌──────▼───────┐
                                         │  Database    │
                                         │  (SQLite)    │
                                         └──────────────┘

Pros: Multi-user, cloud sync
Cons: Requires server
```

### Option 3: Production Cloud
```
┌────────────┐         CDN          ┌─────────────┐
│  Clients   │◄────────────────────►│  CloudFlare │
│ (Global)   │    Static Assets     │  (CDN)      │
└────────────┘                       └─────────────┘
      │
      │ HTTPS/JWT
      ▼
┌─────────────────┐
│  Load Balancer  │
│  (nginx)        │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────┐  ┌──────┐      ┌──────────────┐
│ API  │  │ API  │◄────►│  PostgreSQL  │
│ Node │  │ Node │      │  (Primary)   │
└──────┘  └──────┘      └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │  PostgreSQL  │
                         │  (Replica)   │
                         └──────────────┘

Pros: Scalable, reliable, fast
Cons: More complex, higher cost
```

---

## Data Synchronization

### Sync Strategy
```
Client-Side State:
  ├── current (number)
  ├── checks (object)
  ├── notes (object)
  ├── quizAnswers (object)
  └── theme (string)

Sync Triggers:
  1. Manual: User clicks "sync" button
  2. Auto: On stage change
  3. Auto: On note save
  4. Auto: On quiz answer
  5. Periodic: Every 5 minutes (optional)

Conflict Resolution:
  - Last-write-wins (timestamp based)
  - Server timestamp authoritative
  - No merge conflicts (full object replace)
```

### Offline/Online Flow
```
┌─────────────┐
│   ONLINE    │
└─────────────┘
      │
      │ Internet disconnects
      ▼
┌─────────────┐
│   OFFLINE   │
│             │
│  Queue:     │
│  - Changes  │
│  - Actions  │
└─────────────┘
      │
      │ Internet reconnects
      ▼
┌─────────────┐
│   SYNC      │
│             │
│  Send queue │
│  Get latest │
└─────────────┘
      │
      ▼
┌─────────────┐
│   ONLINE    │
└─────────────┘
```

---

## Mobile App Architecture

### Capacitor Bridge
```
┌─────────────────────────────────────┐
│         Web Layer (HTML/CSS/JS)     │
│  - Same code as web version         │
│  - Responsive UI                    │
└─────────────────┬───────────────────┘
                  │
         ┌────────▼────────┐
         │  Capacitor API  │
         │   (JavaScript)  │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │                           │
    ▼                           ▼
┌──────────┐              ┌──────────┐
│   iOS    │              │ Android  │
│ Native   │              │ Native   │
│ (Swift)  │              │ (Kotlin) │
└──────────┘              └──────────┘
```

### Native Features
```
JavaScript Call → Capacitor Plugin → Native API

Examples:
  - SplashScreen.show()    → Native splash
  - StatusBar.setStyle()   → Native status bar
  - Keyboard.hide()        → Native keyboard
  - Haptics.vibrate()      → Native haptics
```

---

## Performance Considerations

### Optimization Strategies
```
Frontend:
  ├── Minimize DOM updates
  ├── Use CSS transforms (GPU)
  ├── Lazy load images
  ├── Debounce search inputs
  └── Cache API responses

Backend:
  ├── Database indexing (email, userId)
  ├── Connection pooling
  ├── Response compression (gzip)
  ├── Rate limiting
  └── Caching layer (Redis optional)

Mobile:
  ├── Reduce bundle size
  ├── Optimize images (WebP)
  ├── Use native scrolling
  ├── Background sync
  └── Smart caching
```

---

## Scalability Path

### Phase 1: MVP (Current)
- Single server
- SQLite database
- Basic features
- **Supports:** ~100 users

### Phase 2: Growth
- Multiple API servers (load balanced)
- PostgreSQL (primary + replica)
- Redis cache
- **Supports:** ~10,000 users

### Phase 3: Scale
- Microservices architecture
- CDN for static assets
- Distributed database
- Message queue (RabbitMQ)
- **Supports:** 100,000+ users

---

## Security Architecture

```
┌─────────────────────────────────────────┐
│  Client (Browser/Mobile)                │
│  - HTTPS only                           │
│  - Token storage (secure)               │
│  - Input validation                     │
└─────────────┬───────────────────────────┘
              │ Encrypted channel
              │ (TLS 1.3)
┌─────────────▼───────────────────────────┐
│  API Gateway                            │
│  - Rate limiting                        │
│  - DDoS protection                      │
│  - Request validation                   │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│  Application Server                     │
│  - JWT verification                     │
│  - Role-based access                    │
│  - Input sanitization                   │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│  Database                               │
│  - Encrypted at rest                    │
│  - Parameterized queries                │
│  - Regular backups                      │
└─────────────────────────────────────────┘
```

---

## Monitoring & Logging

### Recommended Tools
```
Monitoring:
  - PM2 (process management)
  - New Relic / DataDog
  - Uptime Robot

Logging:
  - Winston (structured logs)
  - ELK Stack (Elasticsearch, Logstash, Kibana)
  - Sentry (error tracking)

Analytics:
  - Google Analytics (user behavior)
  - Mixpanel (events)
  - Custom dashboard (progress metrics)
```

---

## Backup Strategy

```
Automated Backups:
  ├── Database: Daily full backup
  ├── User data: Hourly incremental
  ├── Logs: Weekly archive
  └── Config: Version controlled (Git)

Retention:
  ├── Daily: 7 days
  ├── Weekly: 4 weeks
  └── Monthly: 12 months

Recovery:
  ├── RTO (Recovery Time Objective): < 1 hour
  └── RPO (Recovery Point Objective): < 24 hours
```

---

## Development Workflow

```
Developer → Git Push → CI/CD → Production

Steps:
  1. Local development
  2. Git commit & push
  3. Automated tests (optional)
  4. Build & package
  5. Deploy to staging
  6. Manual QA
  7. Deploy to production
  8. Monitor & log
```

---

**This architecture supports everything from a simple learning app to an enterprise-scale training platform! 🚀**
