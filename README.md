# 🏆 LeagueFlow - Sports League Management Platform

A comprehensive sports league management system built with Next.js 15, featuring real-time match reporting, automated scheduling, and innovative QR code fan engagement.

![LeagueFlow Dashboard](public/screenshots/dashboard.png)

## ✨ Features

### 🎯 Core Features
- **Multi-Sport Support**: Soccer, Basketball, Hockey with sport-specific configurations
- **Role-Based Access**: League Admins, Team Managers, and Referees with different permissions
- **Automated Scheduling**: Round-robin tournament generation with conflict detection
- **Real-Time Updates**: Live match scores and standings via WebSocket
- **Mobile PWA**: Installable progressive web app for mobile devices

### 🏟️ League Management
- Create and configure leagues with custom point systems (3-1-0, 2-1-0, custom)
- Manage teams, players, and rosters with photo uploads
- Automated standings calculation with tiebreaker rules
- Season scheduling with flexible date distribution

### ⚽ Match Management
- Mobile-optimized referee interface for live reporting
- Real-time score tracking and event logging
- Match timer with start/stop functionality
- Complete match history and statistics

### 📱 QR Code Fan Engagement
- **Unique QR codes** generated per match for fan access
- **No-app video capture** directly from mobile browsers
- Fan video gallery with approval workflow
- Social sharing and viral content features

### 📊 Analytics & Reporting
- Real-time league standings with automatic updates
- Team and player performance statistics
- Match result tracking and history
- Fan engagement metrics and analytics

## 🚀 Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS with custom sports theme
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase recommended)
- **Authentication**: NextAuth.js with Google OAuth + Credentials
- **Real-time**: Pusher WebSocket integration
- **File Storage**: Cloudinary for images and videos
- **Deployment**: Vercel with edge functions

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)
- Cloudinary account (for file uploads)
- Pusher account (for real-time features)

### 1. Clone & Install
```bash
git clone https://github.com/I-N-SILVA/LeagueNow.git
cd LeagueNow
npm install
```

### 2. Environment Setup
Copy the environment template:
```bash
cp .env.example .env.local
```

Configure your `.env.local` with:
```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/leagueflow"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Services (see setup guide below)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
PUSHER_KEY="your-pusher-key"
# ... (see .env.example for complete list)
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed with sample data
npm run db:seed
```

### 4. Start Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you're ready to go! 🎉

## 🔧 Service Setup Guide

### Supabase (Database)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Add to `DATABASE_URL` in your environment

### Cloudinary (File Storage)
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get credentials from Dashboard
3. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Pusher (Real-time)
1. Create account at [pusher.com](https://pusher.com)
2. Create new Channels app
3. Get credentials from App Keys
4. Add `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`

## 🚀 Production Deployment

### Deploy to Vercel
1. **Connect GitHub**: Push your code to GitHub
2. **Import to Vercel**: Visit [vercel.com](https://vercel.com) and import your repository
3. **Environment Variables**: Add all environment variables in Vercel dashboard
4. **Deploy**: Automatic deployment from GitHub

### Post-Deployment
```bash
# Set up production database
vercel env pull .env.local
npx prisma migrate deploy
npm run db:seed
```

Your app will be live at `https://your-app-name.vercel.app`

## 🎮 User Guide

### Test Accounts (Development)
After running `npm run db:seed`:
```
Admin: admin@leagueflow.com / password123
Manager: manager1@team.com / password123  
Referee: referee1@league.com / password123
```

### For League Administrators
1. **Create League** → Set sport type and point system
2. **Manage Teams** → Approve registrations and oversee league
3. **Generate Schedule** → Automated or manual match scheduling
4. **Monitor Progress** → Real-time standings and statistics

### For Team Managers  
1. **Register Team** → Join leagues with team details
2. **Add Players** → Upload player photos and assign positions
3. **View Schedule** → Check upcoming matches and results
4. **Track Performance** → Monitor team statistics

### For Referees
1. **Mobile Dashboard** → Access assigned matches
2. **Live Match Control** → Touch-friendly scoring interface
3. **Real-time Updates** → Broadcast scores as they happen
4. **Match Management** → Start, pause, and complete matches

### For Fans
1. **Scan QR Code** → Access match via smartphone camera
2. **Upload Videos** → Capture and share match highlights
3. **Browse Gallery** → View community videos
4. **No App Required** → Works directly in mobile browser

## 📱 PWA Features

- **Offline Support**: Works without internet connection
- **Install Prompt**: Add to home screen like native app
- **Push Notifications**: Real-time match updates (optional)
- **Background Sync**: Sync data when connection restored

## 🔐 Security Features

- **Authentication**: Secure JWT-based auth with NextAuth.js
- **Authorization**: Role-based access control (Admin/Manager/Referee)
- **Input Validation**: Comprehensive form and API validation
- **File Security**: Secure upload handling with Cloudinary
- **Headers**: Security headers configured in vercel.json

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database (development)
```

### Database Operations
```bash
npx prisma generate  # Generate Prisma client
npx prisma migrate dev  # Create and apply migrations
npx prisma studio    # Visual database browser
```

## 📊 Database Schema

### Core Models
- **Users**: Authentication and roles (Admin/Manager/Referee)
- **Leagues**: League configuration and sport settings
- **Teams**: Team details and manager relationships
- **Players**: Player profiles with photos and positions
- **Matches**: Scheduling, scores, and match data
- **Standings**: Real-time league table calculations
- **FanVideos**: User-generated match content with approval

### Key Relationships
```
User → League (created_by)
User → Team (manager)  
League → Team → Player
League → Match → FanVideo
League → Standing
```

## 🎯 API Reference

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/session` - Current session

### Leagues  
- `GET /api/leagues` - List leagues
- `POST /api/leagues` - Create league
- `GET /api/leagues/[id]/standings` - League table

### Matches
- `GET /api/matches` - List matches
- `PUT /api/matches/[id]/score` - Update score
- `POST /api/matches/[id]/complete` - Complete match

### Fan Features
- `GET /api/fan/matches/[id]` - Match info for fans
- `POST /api/fan/matches/[id]/videos` - Upload video

## 🚀 Production Deployment

### Quick Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/I-N-SILVA/LeagueNow)

### Manual Deployment

1. **Automated Setup Script**
   ```bash
   ./scripts/deploy-setup.sh
   ```

2. **Service Configuration**
   - Follow `PRODUCTION_SERVICES.md` for detailed service setup
   - Configure Supabase, Google OAuth, Cloudinary, and Pusher
   - See `VERCEL_DEPLOYMENT.md` for step-by-step Vercel deployment

3. **Environment Variables**
   Configure these in Vercel dashboard or your hosting provider:
   ```env
   DATABASE_URL=your-supabase-url
   NEXTAUTH_SECRET=your-secret
   GOOGLE_CLIENT_ID=your-google-id
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   PUSHER_KEY=your-pusher-key
   # ... see DEPLOYMENT_CHECKLIST.md for complete list
   ```

4. **Database Migration**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Live Demo
🌐 **[View Live Demo](https://your-deployed-app.vercel.app)**

Test accounts:
- **Admin**: admin@leagueflow.com / password123
- **Manager**: manager1@team.com / password123
- **Referee**: referee1@league.com / password123

### Deployment Documentation
- 📋 **[Complete Deployment Checklist](DEPLOYMENT_CHECKLIST.md)**
- 🔧 **[Production Services Setup](PRODUCTION_SERVICES.md)**
- ⚡ **[Vercel Deployment Guide](VERCEL_DEPLOYMENT.md)**

## 🔮 Roadmap

- [ ] **Tournament Brackets** - Elimination tournament support
- [ ] **Live Streaming** - Integration with streaming platforms  
- [ ] **Advanced Analytics** - AI-powered insights and predictions
- [ ] **Mobile Apps** - Native iOS and Android applications
- [ ] **Payment Integration** - League fees and payment processing
- [ ] **Multi-language** - International language support
- [ ] **Social Features** - Enhanced fan interaction and social sharing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Community help and feature requests
- **Documentation**: Comprehensive guides in this README

---

**Built with ❤️ for sports communities worldwide**

*Making league management effortless and fan engagement unforgettable* 🏆
