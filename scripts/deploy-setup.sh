#!/bin/bash

# LeagueFlow Deployment Setup Script
echo "🚀 LeagueFlow Deployment Setup"
echo "================================"

# Check if required tools are installed
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }
command -v npx >/dev/null 2>&1 || { echo "❌ npx is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Required tools found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating template..."
    cat > .env.local << 'EOF'
# Database (Supabase)
DATABASE_URL="postgresql://postgres:[password]@[host]/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[password]@[host]/postgres"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Real-time (Pusher)
NEXT_PUBLIC_PUSHER_APP_ID="your-pusher-app-id"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"
PUSHER_SECRET="your-pusher-secret"
EOF
    echo "📝 Created .env.local template. Please fill in your actual values."
    echo "📖 See PRODUCTION_SERVICES.md for detailed setup instructions."
else
    echo "✅ .env.local found"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Test build
echo "🔨 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Check if database is configured
    if grep -q "your-generated-secret-here\|your-google-client-id\|your-cloud-name\|your-pusher-app-id" .env.local; then
        echo "⚠️  Environment variables still contain template values."
        echo "📖 Please update .env.local with your actual service credentials."
        echo "📋 Next steps:"
        echo "   1. Configure services (see PRODUCTION_SERVICES.md)"
        echo "   2. Update .env.local with real values"
        echo "   3. Run database migration: npx prisma migrate dev"
        echo "   4. Seed database: npx prisma db seed"
        echo "   5. Test locally: npm run dev"
        echo "   6. Deploy to Vercel (see VERCEL_DEPLOYMENT.md)"
    else
        echo "✅ Environment variables appear to be configured"
        
        # Offer to run migrations
        read -p "🗄️  Run database migrations? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🗄️  Running database migrations..."
            npx prisma migrate deploy
            
            read -p "🌱 Seed database with sample data? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo "🌱 Seeding database..."
                npx prisma db seed
                echo "✅ Database seeded with sample data"
            fi
        fi
        
        echo "🎉 Setup complete! Ready for deployment."
        echo "📋 Final steps:"
        echo "   1. Test locally: npm run dev"
        echo "   2. Deploy to Vercel (see VERCEL_DEPLOYMENT.md)"
    fi
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo ""
echo "📖 Documentation:"
echo "   • PRODUCTION_SERVICES.md - Service setup guide"
echo "   • VERCEL_DEPLOYMENT.md - Deployment instructions"
echo "   • README.md - General information"
echo ""
echo "🚀 Happy deploying!"