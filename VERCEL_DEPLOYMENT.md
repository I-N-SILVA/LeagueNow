# Vercel Deployment Guide

## Step 1: Vercel Setup
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Connect your GitHub account to Vercel
3. Import the `LeagueNow` repository from GitHub

## Step 2: Environment Variables Setup
Configure these environment variables in Vercel dashboard:

### Database (Supabase)
```
DATABASE_URL="postgresql://[username]:[password]@[host]/[database]?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://[username]:[password]@[host]/[database]"
```

### Authentication (NextAuth.js)
```
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="your-random-secret-key-here"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```

### File Storage (Cloudinary)
```
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

### Real-time Updates (Pusher)
```
NEXT_PUBLIC_PUSHER_APP_ID="your-pusher-app-id"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"
PUSHER_SECRET="your-pusher-secret"
```

## Step 3: Database Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your database connection strings
3. Run database migrations:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

## Step 4: Service Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your Vercel domain to authorized origins

### Cloudinary Setup
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and secret
3. Configure upload presets if needed

### Pusher Setup
1. Sign up at [pusher.com](https://pusher.com)
2. Create a new app
3. Get your app credentials
4. Configure CORS settings for your domain

## Step 5: Deploy
1. In Vercel dashboard, click "Deploy"
2. Wait for build to complete
3. Visit your deployed application

## Step 6: Post-Deployment
1. Test authentication flow
2. Test file uploads
3. Test real-time features
4. Run database seeding in production if needed

## Build Command (if needed)
```
npm run build
```

## Install Command (if needed)
```
npm install
```

## Environment Variables Quick Copy
```
# Database
DATABASE_URL=
DIRECT_URL=

# Auth
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Real-time
NEXT_PUBLIC_PUSHER_APP_ID=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
PUSHER_SECRET=
```