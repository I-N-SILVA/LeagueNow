"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Trophy, 
  Users, 
  Calendar, 
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface DashboardStats {
  totalLeagues: number
  totalTeams: number
  totalMatches: number
  upcomingMatches: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalLeagues: 0,
    totalTeams: 0,
    totalMatches: 0,
    upcomingMatches: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchDashboardData()
    }
  }, [status, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "LEAGUE_ADMIN":
        return "League Administrator"
      case "TEAM_MANAGER":
        return "Team Manager"
      case "REFEREE":
        return "Referee"
      default:
        return role.replace("_", " ").toLowerCase()
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getWelcomeMessage()}, {session.user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome to your LeagueFlow dashboard as {getRoleDisplayName(session.user.role)}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          {session.user.role === "LEAGUE_ADMIN" && (
            <Button variant="sports" asChild>
              <Link href="/leagues/create">
                <Plus className="mr-2 h-4 w-4" />
                Create League
              </Link>
            </Button>
          )}
          
          {(session.user.role === "TEAM_MANAGER" || session.user.role === "LEAGUE_ADMIN") && (
            <Button variant="team" asChild>
              <Link href="/teams/register">
                <Plus className="mr-2 h-4 w-4" />
                Register Team
              </Link>
            </Button>
          )}
          
          <Button variant="outline" asChild>
            <Link href="/leagues">
              <Trophy className="mr-2 h-4 w-4" />
              Browse Leagues
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="sport-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {session.user.role === "LEAGUE_ADMIN" ? "My Leagues" : "Joined Leagues"}
              </CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeagues}</div>
              <p className="text-xs text-muted-foreground">
                Active competitions
              </p>
            </CardContent>
          </Card>

          <Card className="team-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {session.user.role === "TEAM_MANAGER" ? "My Teams" : "Total Teams"}
              </CardTitle>
              <Users className="h-4 w-4 text-success-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeams}</div>
              <p className="text-xs text-muted-foreground">
                Registered teams
              </p>
            </CardContent>
          </Card>

          <Card className="match-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <Calendar className="h-4 w-4 text-warning-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMatches}</div>
              <p className="text-xs text-muted-foreground">
                All time matches
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingMatches}</div>
              <p className="text-xs text-muted-foreground">
                Matches this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-success-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Welcome to LeagueFlow!
                    </p>
                    <p className="text-sm text-gray-500">
                      Your account has been successfully created. Start by creating your first league or joining an existing one.
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Just now
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
              <CardDescription>
                Common tasks and navigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center" asChild>
                  <Link href="/leagues">
                    <Trophy className="h-6 w-6 mb-2" />
                    <span className="text-sm">Leagues</span>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center" asChild>
                  <Link href="/teams">
                    <Users className="h-6 w-6 mb-2" />
                    <span className="text-sm">Teams</span>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center" asChild>
                  <Link href="/matches">
                    <Calendar className="h-6 w-6 mb-2" />
                    <span className="text-sm">Matches</span>
                  </Link>
                </Button>
                
                {session.user.role === "REFEREE" && (
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center" asChild>
                    <Link href="/referee">
                      <AlertCircle className="h-6 w-6 mb-2" />
                      <span className="text-sm">Referee</span>
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Section for New Users */}
        {stats.totalLeagues === 0 && stats.totalTeams === 0 && (
          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">Getting Started</CardTitle>
              <CardDescription>
                Welcome to LeagueFlow! Here&apos;s how to get started based on your role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session.user.role === "LEAGUE_ADMIN" && (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Create Your First League</h4>
                      <p className="text-sm text-muted-foreground">Set up a new league with your preferred sport and settings.</p>
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <Link href="/leagues/create">Create League →</Link>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Invite Teams</h4>
                      <p className="text-sm text-muted-foreground">Share your league registration link with teams.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Generate Schedule</h4>
                      <p className="text-sm text-muted-foreground">Automatically create match fixtures when ready.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {session.user.role === "TEAM_MANAGER" && (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Browse Available Leagues</h4>
                      <p className="text-sm text-muted-foreground">Find leagues that match your sport and skill level.</p>
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <Link href="/leagues">Browse Leagues →</Link>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Register Your Team</h4>
                      <p className="text-sm text-muted-foreground">Sign up for leagues and add your team details.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Add Players</h4>
                      <p className="text-sm text-muted-foreground">Build your roster with player details and photos.</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  )
}