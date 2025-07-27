# Production Services Configuration

## 1. Database - Supabase Setup

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New Project"
3. Choose organization and project name: "LeagueFlow"
4. Set database password (save this!)
5. Choose region closest to your users

### Get Database URLs
1. Go to Project Settings > Database
2. Copy the Connection String (this is your `DATABASE_URL`)
3. Copy the Direct Connection (this is your `DIRECT_URL`)
4. Replace `[YOUR-PASSWORD]` with your actual password

### Database Migration
```bash
# Set environment variables
export DATABASE_URL="your-supabase-connection-string"
export DIRECT_URL="your-supabase-direct-connection"

# Run migrations
npx prisma migrate deploy

# Seed the database
npx prisma db seed
```

## 2. Authentication - Google OAuth

### Google Cloud Console Setup
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project: "LeagueFlow"
3. Navigate to APIs & Services > Credentials
4. Click "Create Credentials" > OAuth 2.0 Client IDs
5. Configure OAuth consent screen first:
   - User Type: External
   - App name: "LeagueFlow"
   - User support email: your email
   - Developer contact: your email

### OAuth Client Configuration
1. Application type: Web application
2. Name: "LeagueFlow Web"
3. Authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://your-vercel-domain.vercel.app` (for production)
4. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-vercel-domain.vercel.app/api/auth/callback/google`

### Get Credentials
- Copy `Client ID` → `GOOGLE_CLIENT_ID`
- Copy `Client Secret` → `GOOGLE_CLIENT_SECRET`

## 3. File Storage - Cloudinary

### Cloudinary Account Setup
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Note your credentials:
   - Cloud Name → `CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`

### Upload Presets (Optional)
1. Go to Settings > Upload
2. Create upload preset: "leagueflow"
3. Set folder: "leagueflow"
4. Enable: "Use filename as Public ID"

## 4. Real-time Features - Pusher

### Pusher Account Setup
1. Sign up at [pusher.com](https://pusher.com)
2. Create new app: "LeagueFlow"
3. Choose cluster closest to your users
4. Note your credentials:
   - App ID → `NEXT_PUBLIC_PUSHER_APP_ID`
   - Key → `NEXT_PUBLIC_PUSHER_KEY`
   - Secret → `PUSHER_SECRET`
   - Cluster → `NEXT_PUBLIC_PUSHER_CLUSTER`

### CORS Configuration
1. Go to App Settings
2. Enable CORS for your domains:
   - `http://localhost:3000`
   - `https://your-vercel-domain.vercel.app`

## 5. NextAuth Configuration

### Generate Secret
```bash
# Generate a random secret
openssl rand -base64 32
```
Use this as your `NEXTAUTH_SECRET`

### Set Auth URL
- Development: `http://localhost:3000`
- Production: `https://your-vercel-domain.vercel.app`

## 6. Environment Variables Summary

Create a `.env.local` file for local development:
```env
# Database
DATABASE_URL="postgresql://postgres:[password]@[host]/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[password]@[host]/postgres"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# File Storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Real-time
NEXT_PUBLIC_PUSHER_APP_ID="your-pusher-app-id"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"
PUSHER_SECRET="your-pusher-secret"
```

## 7. Verification Steps

### Test Database Connection
```bash
npx prisma db pull
```

### Test Authentication
1. Start development server: `npm run dev`
2. Go to `/auth/signin`
3. Test Google sign-in

### Test File Upload
1. Go to team registration page
2. Try uploading a team logo
3. Check Cloudinary dashboard for uploaded files

### Test Real-time Features
1. Open referee dashboard
2. Start a match
3. Update scores
4. Verify updates appear in real-time

## 8. Production Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database migrated and seeded
- [ ] Google OAuth configured with production URLs
- [ ] Cloudinary account set up
- [ ] Pusher app configured with CORS
- [ ] All environment variables set in Vercel
- [ ] Domain configured in all services
- [ ] SSL certificates active
- [ ] Test all major features

## 9. Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **CORS**: Only allow your domains in Pusher and other services
3. **Database**: Use connection pooling (pgBouncer) for Supabase
4. **OAuth**: Regularly rotate client secrets
5. **API Keys**: Monitor usage and set up alerts

## 10. Monitoring & Maintenance

1. **Vercel Analytics**: Enable in project settings
2. **Supabase Monitoring**: Check database performance
3. **Cloudinary Usage**: Monitor storage and bandwidth
4. **Pusher Limits**: Track message quotas
5. **Error Tracking**: Consider adding Sentry for error monitoring