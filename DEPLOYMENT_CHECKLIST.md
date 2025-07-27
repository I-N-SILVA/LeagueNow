# LeagueFlow Deployment Checklist

## Pre-Deployment Setup

### 1. Service Accounts Setup
- [ ] **Supabase**: Create project and get database URLs
- [ ] **Google Cloud**: Set up OAuth 2.0 credentials
- [ ] **Cloudinary**: Create account and get API credentials
- [ ] **Pusher**: Create app and get real-time credentials
- [ ] **Vercel**: Connect GitHub repository

### 2. Environment Configuration
- [ ] Create `.env.local` for local development
- [ ] Generate `NEXTAUTH_SECRET` using `openssl rand -base64 32`
- [ ] Configure all service credentials in environment variables
- [ ] Test environment variables locally

### 3. Database Setup
- [ ] Run `npx prisma migrate deploy` to create tables
- [ ] Run `npx prisma db seed` to populate sample data
- [ ] Verify database connection with `npx prisma db pull`

### 4. Local Testing
- [ ] Run `npm run dev` and test locally
- [ ] Test user authentication (Google OAuth)
- [ ] Test file uploads (team logos)
- [ ] Test league creation and team registration
- [ ] Test referee match management
- [ ] Test fan video upload functionality

## Vercel Deployment

### 1. Import Project
- [ ] Go to [vercel.com](https://vercel.com) and login
- [ ] Click "Import Project"
- [ ] Select GitHub and find `LeagueNow` repository
- [ ] Configure build settings:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`

### 2. Environment Variables
Configure in Vercel dashboard under Settings > Environment Variables:

**Database (Supabase)**
- [ ] `DATABASE_URL`
- [ ] `DIRECT_URL`

**Authentication (NextAuth.js)**
- [ ] `NEXTAUTH_URL` (your Vercel app URL)
- [ ] `NEXTAUTH_SECRET`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`

**File Storage (Cloudinary)**
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

**Real-time (Pusher)**
- [ ] `NEXT_PUBLIC_PUSHER_APP_ID`
- [ ] `NEXT_PUBLIC_PUSHER_KEY`
- [ ] `NEXT_PUBLIC_PUSHER_CLUSTER`
- [ ] `PUSHER_SECRET`

### 3. Deploy
- [ ] Click "Deploy" in Vercel dashboard
- [ ] Wait for build to complete (check build logs for errors)
- [ ] Note your deployment URL

## Post-Deployment Configuration

### 1. Update Service URLs
- [ ] **Google OAuth**: Add Vercel URL to authorized origins and redirect URIs
- [ ] **Pusher**: Add Vercel domain to CORS settings
- [ ] **Supabase**: Update any CORS settings if needed

### 2. Production Database
- [ ] Run database migrations in production:
  ```bash
  # Set production DATABASE_URL
  export DATABASE_URL="your-production-database-url"
  npx prisma migrate deploy
  npx prisma db seed
  ```

### 3. DNS and Domain (Optional)
- [ ] Configure custom domain in Vercel
- [ ] Update all service configurations with custom domain
- [ ] Update environment variable `NEXTAUTH_URL`

## Testing Production Deployment

### 1. Authentication Testing
- [ ] Visit `/auth/signin` on production URL
- [ ] Test Google OAuth login
- [ ] Verify user session and role assignment
- [ ] Test logout functionality

### 2. Core Functionality Testing
- [ ] **League Admin**:
  - [ ] Create new league
  - [ ] Manage league settings
  - [ ] View league dashboard
  
- [ ] **Team Manager**:
  - [ ] Register team for league
  - [ ] Upload team logo
  - [ ] Manage team details
  
- [ ] **Referee**:
  - [ ] View assigned matches
  - [ ] Start match
  - [ ] Update scores
  - [ ] Complete match

- [ ] **Fan Features**:
  - [ ] Scan QR code for match
  - [ ] Upload fan videos
  - [ ] View match information

### 3. Real-time Features
- [ ] Open multiple browser windows
- [ ] Update match scores from referee dashboard
- [ ] Verify real-time updates in standings
- [ ] Test match status changes

### 4. File Upload Testing
- [ ] Upload team logos in team registration
- [ ] Upload fan videos for matches
- [ ] Verify files appear in Cloudinary dashboard
- [ ] Test image optimization and delivery

## Performance and Monitoring

### 1. Performance Check
- [ ] Run Lighthouse audit on key pages
- [ ] Check Core Web Vitals
- [ ] Test mobile responsiveness
- [ ] Verify PWA functionality

### 2. Error Monitoring
- [ ] Check Vercel Functions logs
- [ ] Monitor Supabase database performance
- [ ] Check Cloudinary usage metrics
- [ ] Monitor Pusher connection metrics

### 3. Security Review
- [ ] Verify all secrets are in environment variables
- [ ] Check CORS configurations
- [ ] Review OAuth callback URLs
- [ ] Test rate limiting (if implemented)

## Go-Live Checklist

### 1. Final Verification
- [ ] All features working correctly
- [ ] Database populated with initial data
- [ ] All integrations functioning
- [ ] Error handling working properly
- [ ] Mobile experience optimized

### 2. Documentation
- [ ] Update README with live URL
- [ ] Document admin credentials
- [ ] Create user guide (optional)
- [ ] Document any known issues

### 3. Backup and Recovery
- [ ] Document backup procedures
- [ ] Test database restore process
- [ ] Document rollback procedures
- [ ] Set up monitoring alerts

## Production URLs and Credentials

**Live Application**: `https://your-app-name.vercel.app`

**Test Accounts** (from seed data):
- **Admin**: admin@leagueflow.com / password123
- **Manager**: manager1@team.com / password123  
- **Referee**: referee1@league.com / password123

**Admin Dashboards**:
- Vercel: [vercel.com/dashboard](https://vercel.com/dashboard)
- Supabase: [supabase.com/dashboard](https://supabase.com/dashboard)
- Cloudinary: [cloudinary.com/console](https://cloudinary.com/console)
- Pusher: [dashboard.pusher.com](https://dashboard.pusher.com)

## Troubleshooting

### Common Issues
1. **Build Failures**: Check environment variables and TypeScript errors
2. **Auth Issues**: Verify OAuth URLs and secrets
3. **Database Errors**: Check connection strings and migrations
4. **File Upload Issues**: Verify Cloudinary credentials
5. **Real-time Issues**: Check Pusher configuration and CORS

### Support Resources
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)