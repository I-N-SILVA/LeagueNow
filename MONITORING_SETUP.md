# 📊 LeagueFlow Monitoring & Analytics Setup

Complete guide for setting up monitoring, analytics, and performance tracking for your LeagueFlow platform.

## 🎯 Overview

This guide covers:
- Error tracking with Sentry
- Performance monitoring
- User analytics  
- Database monitoring
- Uptime monitoring

---

## 🚨 Error Tracking with Sentry

### 1. Set Up Sentry Account
1. **Create Account**: Visit [sentry.io](https://sentry.io)
2. **Create Project**: Select "Next.js" as platform
3. **Get DSN**: Copy your project DSN from the setup page

### 2. Install Sentry
```bash
npm install @sentry/nextjs
```

### 3. Configure Sentry
Create `sentry.client.config.js`:
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

Create `sentry.server.config.js`:
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

### 4. Add Environment Variable
```env
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
```

---

## 📈 Vercel Analytics

### 1. Enable in Vercel Dashboard
1. Go to your project in Vercel
2. Navigate to **Analytics** tab
3. Click **"Enable Analytics"**

### 2. Add to Your App
```bash
npm install @vercel/analytics
```

Update `src/app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 🎯 User Analytics with PostHog

### 1. Set Up PostHog
1. **Create Account**: Visit [posthog.com](https://posthog.com)
2. **Get API Key**: Copy from project settings
3. **Get Host**: Usually `https://app.posthog.com`

### 2. Install PostHog
```bash
npm install posthog-js
```

### 3. Configure PostHog
Create `src/lib/analytics.ts`:
```typescript
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug()
    }
  })
}

export default posthog
```

### 4. Add Environment Variables
```env
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 5. Track Events
```typescript
import posthog from '@/lib/analytics'

// Track league creation
posthog.capture('league_created', {
  sport: 'soccer',
  teams_count: 4
})

// Track match completion
posthog.capture('match_completed', {
  league_id: 'league-123',
  home_score: 2,
  away_score: 1
})
```

---

## 📊 Database Monitoring

### 1. Supabase Built-in Monitoring
1. **Dashboard**: Go to your Supabase project
2. **Reports**: Check database performance metrics
3. **Logs**: Monitor real-time database logs

### 2. Custom Database Metrics
Create `src/lib/database-metrics.ts`:
```typescript
import { prisma } from '@/lib/prisma'

export async function getDatabaseMetrics() {
  const [
    totalUsers,
    totalLeagues,
    totalMatches,
    activeLeagues
  ] = await Promise.all([
    prisma.user.count(),
    prisma.league.count(),
    prisma.match.count(),
    prisma.league.count({
      where: { status: 'ACTIVE' }
    })
  ])

  return {
    totalUsers,
    totalLeagues,
    totalMatches,
    activeLeagues,
    timestamp: new Date().toISOString()
  }
}
```

---

## ⏱️ Uptime Monitoring

### 1. UptimeRobot (Free)
1. **Create Account**: Visit [uptimerobot.com](https://uptimerobot.com)
2. **Add Monitor**: 
   - **Type**: HTTP(s)
   - **URL**: Your Vercel app URL
   - **Interval**: 5 minutes
3. **Alerts**: Set up email/SMS notifications

### 2. Better Uptime (Alternative)
1. **Create Account**: Visit [betteruptime.com](https://betteruptime.com)
2. **Create Monitor**: Add your app URL
3. **Set Alerts**: Configure notification preferences

---

## 🚀 Performance Monitoring

### 1. Vercel Speed Insights
Enable in Vercel dashboard:
```bash
npm install @vercel/speed-insights
```

Add to layout:
```tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 2. Web Vitals Tracking
Create `src/lib/web-vitals.ts`:
```typescript
import { Metric } from 'web-vitals'

export function sendToAnalytics(metric: Metric) {
  // Send to your analytics provider
  console.log('Web Vital:', metric)
  
  // Example: Send to PostHog
  if (typeof window !== 'undefined') {
    posthog.capture('web_vital', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating
    })
  }
}
```

---

## 📱 Application Monitoring

### 1. Custom Health Check
Create `src/app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check external services
    const services = {
      database: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    }
    
    return NextResponse.json(services)
  } catch (error) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    )
  }
}
```

### 2. Monitor API Performance
Create middleware in `src/middleware.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const start = Date.now()
  
  const response = NextResponse.next()
  
  // Log API response times
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const duration = Date.now() - start
    console.log(`API ${request.method} ${request.nextUrl.pathname}: ${duration}ms`)
  }
  
  return response
}

export const config = {
  matcher: '/api/:path*'
}
```

---

## 📋 Monitoring Dashboard

### 1. Create Admin Dashboard
Add to `src/app/admin/monitoring/page.tsx`:
```tsx
import { getDatabaseMetrics } from '@/lib/database-metrics'

export default async function MonitoringPage() {
  const metrics = await getDatabaseMetrics()
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Monitoring</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Users" value={metrics.totalUsers} />
        <MetricCard title="Active Leagues" value={metrics.activeLeagues} />
        <MetricCard title="Total Matches" value={metrics.totalMatches} />
        <MetricCard title="Database Status" value="Healthy" />
      </div>
      
      {/* Add more monitoring widgets */}
    </div>
  )
}
```

---

## 🔧 Environment Variables

Add these to your Vercel environment variables:

```env
# Monitoring
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Optional: Custom analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

---

## 📊 Monitoring Checklist

- [ ] **Error Tracking**: Sentry configured and working
- [ ] **Performance**: Vercel Analytics and Speed Insights enabled
- [ ] **User Analytics**: PostHog tracking key events
- [ ] **Database**: Supabase monitoring dashboard
- [ ] **Uptime**: External uptime monitoring service
- [ ] **Health Checks**: API health endpoint created
- [ ] **Alerts**: Notification channels configured
- [ ] **Dashboard**: Admin monitoring page created

---

## 🎯 Key Metrics to Track

### Application Metrics
- **User registrations** (daily/weekly)
- **League creations** (by sport type)
- **Match completions** (success rate)
- **QR code scans** (fan engagement)
- **Video uploads** (fan content)

### Performance Metrics
- **Page load times** (Core Web Vitals)
- **API response times** (by endpoint)
- **Database query performance**
- **Error rates** (by page/API)
- **Uptime percentage**

### Business Metrics
- **Active users** (daily/monthly)
- **League growth** (new vs returning)
- **Feature usage** (most used features)
- **Geographic distribution** (user locations)
- **Device usage** (mobile vs desktop)

---

## 🏆 You're All Set!

Your LeagueFlow platform now has comprehensive monitoring and analytics in place. You'll be able to:

- **Track errors** and fix issues quickly
- **Monitor performance** and optimize bottlenecks  
- **Understand user behavior** and improve features
- **Ensure uptime** and reliability
- **Make data-driven decisions** for growth

**Happy monitoring!** 📊