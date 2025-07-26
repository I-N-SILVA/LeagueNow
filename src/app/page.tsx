import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { 
  Trophy, 
  Users, 
  Calendar, 
  BarChart3, 
  Smartphone, 
  QrCode,
  Zap,
  Shield,
  Globe,
  ArrowRight
} from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 lg:py-32">
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative rounded-full px-4 py-2 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                <span className="text-primary font-semibold">New in v2.0</span> - Mobile PWA support with offline capabilities
              </div>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Sports League Management
              <span className="block sports-gradient bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            
            <p className="mb-8 text-lg leading-8 text-gray-600 sm:text-xl lg:text-2xl">
              Complete platform for managing sports leagues with automated scheduling, 
              real-time updates, mobile referee tools, and fan engagement features.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="sports" asChild>
                <Link href="/auth/signup">
                  Start Your League
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/demo">
                  View Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <svg
            className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="e813992c-7d03-4cc4-a2bd-151760b470a0"
                width={200}
                height={200}
                x="50%"
                y={-1}
                patternUnits="userSpaceOnUse"
              >
                <path d="M100 200V.5M.5 .5H200" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth={0} fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to run a successful league
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              From league creation to fan engagement, LeagueFlow handles every aspect of sports league management.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="sport-card">
              <CardHeader>
                <Trophy className="h-10 w-10 text-primary mb-2" />
                <CardTitle>League Management</CardTitle>
                <CardDescription>
                  Create and manage multiple leagues with different sports, rules, and configurations.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="team-card">
              <CardHeader>
                <Users className="h-10 w-10 text-success-600 mb-2" />
                <CardTitle>Team Registration</CardTitle>
                <CardDescription>
                  Automated team registration with manager account creation and player roster management.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="match-card">
              <CardHeader>
                <Calendar className="h-10 w-10 text-warning-600 mb-2" />
                <CardTitle>Auto Scheduling</CardTitle>
                <CardDescription>
                  Intelligent round-robin scheduling system that handles fixtures automatically.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="sport-card">
              <CardHeader>
                <Smartphone className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Mobile Referee</CardTitle>
                <CardDescription>
                  Mobile-optimized referee interface for live match reporting and score updates.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="team-card">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-success-600 mb-2" />
                <CardTitle>Real-time Tables</CardTitle>
                <CardDescription>
                  Live league table calculations with automatic point updates and standings.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="match-card">
              <CardHeader>
                <QrCode className="h-10 w-10 text-warning-600 mb-2" />
                <CardTitle>Fan Engagement</CardTitle>
                <CardDescription>
                  QR code system for fans to capture and share match videos and moments.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="bg-gray-50 py-20 lg:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built with modern technology
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Powered by the latest web technologies for performance, reliability, and scalability.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-primary-100">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Next.js 15</h3>
              <p className="mt-2 text-gray-600">Latest React framework with App Router and server components</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-success-100">
                <Shield className="h-8 w-8 text-success-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Secure & Scalable</h3>
              <p className="mt-2 text-gray-600">Role-based authentication with PostgreSQL and Prisma ORM</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-warning-100">
                <Globe className="h-8 w-8 text-warning-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Progressive Web App</h3>
              <p className="mt-2 text-gray-600">Mobile-first design with offline capabilities and push notifications</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Join thousands of leagues already using LeagueFlow to manage their sports competitions.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="sports" asChild>
                <Link href="/auth/signup">
                  Create Your League
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/contact">
                  Contact Sales
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
