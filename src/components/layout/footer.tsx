import Link from "next/link"
import { Trophy } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col items-start space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="font-bold">LeagueFlow</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Complete sports league management platform with real-time updates and fan engagement.
            </p>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold">Platform</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link href="/leagues" className="text-muted-foreground hover:text-foreground">
                Leagues
              </Link>
              <Link href="/teams" className="text-muted-foreground hover:text-foreground">
                Teams
              </Link>
              <Link href="/matches" className="text-muted-foreground hover:text-foreground">
                Matches
              </Link>
              <Link href="/standings" className="text-muted-foreground hover:text-foreground">
                Standings
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold">Features</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link href="/features/scheduling" className="text-muted-foreground hover:text-foreground">
                Auto Scheduling
              </Link>
              <Link href="/features/mobile-referee" className="text-muted-foreground hover:text-foreground">
                Mobile Referee
              </Link>
              <Link href="/features/fan-engagement" className="text-muted-foreground hover:text-foreground">
                Fan Engagement
              </Link>
              <Link href="/features/real-time" className="text-muted-foreground hover:text-foreground">
                Real-time Updates
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold">Support</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link href="/help" className="text-muted-foreground hover:text-foreground">
                Help Center
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                Contact Us
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 LeagueFlow. All rights reserved.
          </p>
          <div className="mt-4 sm:mt-0 flex space-x-4 text-sm text-muted-foreground">
            <span>Built with Next.js 15</span>
            <span>•</span>
            <span>Powered by Prisma</span>
          </div>
        </div>
      </div>
    </footer>
  )
}