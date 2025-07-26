"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Trophy, 
  Clock, 
  Calendar,
  Users,
  Play,
  Pause,
  Square,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface RefereeMatch {
  id: string
  round: number
  matchNumber: number
  scheduledAt: string
  startedAt: string | null
  completedAt: string | null
  status: string
  homeScore: number
  awayScore: number
  homeTeam: {
    id: string
    name: string
    logo: string | null
  }
  awayTeam: {
    id: string
    name: string
    logo: string | null
  }
  league: {
    id: string
    name: string
    sport: string
  }
}

export default function RefereePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [matches, setMatches] = useState<RefereeMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'today' | 'in-progress' | 'all'>('today')

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      if (session.user.role !== "REFEREE") {
        router.push("/dashboard")
      } else {
        fetchRefereeMatches()
      }
    }
  }, [status, router, session])

  const fetchRefereeMatches = async () => {
    try {
      const response = await fetch('/api/referee/matches')
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches || [])
      }
    } catch (error) {
      console.error('Failed to fetch referee matches:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'IN_PROGRESS':
        return <Play className="h-4 w-4 text-green-600" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-gray-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const filteredMatches = matches.filter(match => {
    const matchDate = new Date(match.scheduledAt)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    switch (filter) {
      case 'today':
        return matchDate >= today && matchDate < tomorrow
      case 'upcoming':
        return matchDate >= today && match.status === 'SCHEDULED'
      case 'in-progress':
        return match.status === 'IN_PROGRESS'
      case 'all':
        return true
      default:
        return true
    }
  })

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

  if (!session || session.user.role !== "REFEREE") {
    return null
  }

  const todayMatches = matches.filter(match => {
    const matchDate = new Date(match.scheduledAt)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return matchDate >= today && matchDate < tomorrow
  })

  const inProgressMatches = matches.filter(match => match.status === 'IN_PROGRESS')
  const upcomingMatches = matches.filter(match => match.status === 'SCHEDULED')

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Trophy className="h-6 w-6 text-warning-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Referee Dashboard</h1>
              <p className="text-gray-600">Manage your assigned matches</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="match-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Matches</CardTitle>
              <Calendar className="h-4 w-4 text-warning-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayMatches.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card className="sport-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Play className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressMatches.length}</div>
              <p className="text-xs text-muted-foreground">Active matches</p>
            </CardContent>
          </Card>

          <Card className="team-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-success-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingMatches.length}</div>
              <p className="text-xs text-muted-foreground">Future matches</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'today', label: 'Today', count: todayMatches.length },
            { key: 'in-progress', label: 'In Progress', count: inProgressMatches.length },
            { key: 'upcoming', label: 'Upcoming', count: upcomingMatches.length },
            { key: 'all', label: 'All Matches', count: matches.length }
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              variant={filter === key ? "match" : "outline"}
              onClick={() => setFilter(key as 'all' | 'today' | 'upcoming')}
              className="text-sm"
            >
              {label} ({count})
            </Button>
          ))}
        </div>

        {/* Matches List */}
        {filteredMatches.length > 0 ? (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <Card key={match.id} className="match-card hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    {/* Match Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {match.league.name} - Round {match.round}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(match.status)}`}>
                          {getStatusIcon(match.status)}
                          <span>{match.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      
                      {/* Teams */}
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2 min-w-[140px] justify-end">
                          <span className="font-medium">{match.homeTeam.name}</span>
                          {match.homeTeam.logo && (
                            <img
                              src={match.homeTeam.logo}
                              alt={match.homeTeam.name}
                              className="w-6 h-6 object-cover rounded"
                            />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-lg font-bold">
                          <span>{match.homeScore}</span>
                          <span className="text-muted-foreground">-</span>
                          <span>{match.awayScore}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 min-w-[140px]">
                          {match.awayTeam.logo && (
                            <img
                              src={match.awayTeam.logo}
                              alt={match.awayTeam.name}
                              className="w-6 h-6 object-cover rounded"
                            />
                          )}
                          <span className="font-medium">{match.awayTeam.name}</span>
                        </div>
                      </div>
                      
                      {/* Time Info */}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(match.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(match.scheduledAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex space-x-2">
                      {match.status === 'SCHEDULED' && (
                        <Button variant="sports" asChild>
                          <Link href={`/referee/match/${match.id}`}>
                            <Play className="mr-2 h-4 w-4" />
                            Start Match
                          </Link>
                        </Button>
                      )}
                      
                      {match.status === 'IN_PROGRESS' && (
                        <Button variant="match" asChild>
                          <Link href={`/referee/match/${match.id}`}>
                            <Play className="mr-2 h-4 w-4" />
                            Manage
                          </Link>
                        </Button>
                      )}
                      
                      {match.status === 'COMPLETED' && (
                        <Button variant="outline" asChild>
                          <Link href={`/referee/match/${match.id}`}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Review
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No matches found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'today' 
                  ? "You don't have any matches scheduled for today."
                  : `No matches found for the selected filter: ${filter}`}
              </p>
              <Button variant="outline" onClick={() => setFilter('all')}>
                <Calendar className="mr-2 h-4 w-4" />
                View All Matches
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  )
}