"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Target,
  TrendingUp,
  Calendar,
  Users,
  ArrowLeft,
  Medal,
  Crown
} from 'lucide-react'
import { usePusher } from '@/hooks/use-pusher'

interface TeamStanding {
  teamId: string
  teamName: string
  position: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string[]
  team: {
    id: string
    name: string
    logo: string | null
  }
}

interface LeagueInfo {
  id: string
  name: string
  sport: string
  status: string
  startDate: string
  endDate: string | null
  totalTeams: number
  totalMatches: number
  completedMatches: number
}

interface RecentMatch {
  id: string
  round: number
  homeTeam: { name: string }
  awayTeam: { name: string }
  homeScore: number
  awayScore: number
  scheduledAt: string
  status: string
}

export default function LeagueStandingsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [leagueId, setLeagueId] = useState<string>('')
  const [league, setLeague] = useState<LeagueInfo | null>(null)
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeParams = async () => {
      const { id } = await params
      setLeagueId(id)
    }
    initializeParams()
  }, [params])

  useEffect(() => {
    if (leagueId) {
      fetchLeagueStandings()
    }
  }, [leagueId])

  // Real-time standings updates
  usePusher(`league-${leagueId}`, 'standings-updated', (data: unknown) => {
    const typedData = data as Record<string, unknown>
    if (typedData.standings) {
      setStandings(typedData.standings as TeamStanding[])
    }
  })

  const fetchLeagueStandings = async () => {
    try {
      const [standingsRes, recentMatchesRes] = await Promise.all([
        fetch(`/api/leagues/${leagueId}/standings`),
        fetch(`/api/leagues/${leagueId}/matches/recent`)
      ])

      if (standingsRes.ok) {
        const standingsData = await standingsRes.json()
        setLeague(standingsData.league)
        setStandings(standingsData.standings)
      }

      if (recentMatchesRes.ok) {
        const matchesData = await recentMatchesRes.json()
        setRecentMatches(matchesData.matches || [])
      }
    } catch (error) {
      console.error('Failed to fetch league standings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-medium text-muted-foreground">{position}</span>
    }
  }

  const getPositionColor = (position: number, totalTeams: number) => {
    if (position === 1) return 'bg-yellow-50 border-yellow-200'
    if (position <= 3) return 'bg-green-50 border-green-200'
    if (position > totalTeams - 3) return 'bg-red-50 border-red-200'
    return 'bg-white border-gray-200'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
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

  if (!league) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 container py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-destructive">League Not Found</CardTitle>
              <CardDescription>
                The league you&apos;re looking for doesn&apos;t exist or has been removed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a href="/leagues">Back to Leagues</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push(`/leagues/${leagueId}`)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{league.name}</h1>
                <p className="text-muted-foreground">League Standings</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {league.sport}
            </Badge>
          </div>

          {/* League Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{league.totalTeams}</p>
                    <p className="text-xs text-muted-foreground">Teams</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{league.completedMatches}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{league.totalMatches}</p>
                    <p className="text-xs text-muted-foreground">Total Matches</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.round((league.completedMatches / league.totalMatches) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Standings Table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5" />
                    Current Standings
                  </CardTitle>
                  <CardDescription>
                    League table updated in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                          <th className="px-4 py-3">Pos</th>
                          <th className="px-4 py-3">Team</th>
                          <th className="px-4 py-3 text-center">P</th>
                          <th className="px-4 py-3 text-center">W</th>
                          <th className="px-4 py-3 text-center">D</th>
                          <th className="px-4 py-3 text-center">L</th>
                          <th className="px-4 py-3 text-center">GF</th>
                          <th className="px-4 py-3 text-center">GA</th>
                          <th className="px-4 py-3 text-center">GD</th>
                          <th className="px-4 py-3 text-center">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {standings.map((team) => (
                          <tr 
                            key={team.teamId}
                            className={`hover:bg-gray-50 border-l-4 ${getPositionColor(team.position, league.totalTeams)}`}
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center w-8 h-8">
                                {getPositionIcon(team.position)}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center space-x-3">
                                {team.team.logo && (
                                  <img
                                    src={team.team.logo}
                                    alt={team.team.name}
                                    className="w-8 h-8 object-cover rounded"
                                  />
                                )}
                                <span className="font-medium text-gray-900">
                                  {team.team.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center text-sm">{team.played}</td>
                            <td className="px-4 py-4 text-center text-sm">{team.won}</td>
                            <td className="px-4 py-4 text-center text-sm">{team.drawn}</td>
                            <td className="px-4 py-4 text-center text-sm">{team.lost}</td>
                            <td className="px-4 py-4 text-center text-sm">{team.goalsFor}</td>
                            <td className="px-4 py-4 text-center text-sm">{team.goalsAgainst}</td>
                            <td className="px-4 py-4 text-center text-sm">
                              <span className={team.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="font-bold text-lg">{team.points}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Matches */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Matches</CardTitle>
                  <CardDescription>
                    Latest completed fixtures
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentMatches.length > 0 ? (
                    recentMatches.map((match) => (
                      <div key={match.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">
                            Round {match.round} • {formatDate(match.scheduledAt)}
                          </span>
                          <Badge variant={match.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-xs">
                            {match.status}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <div className="flex justify-between items-center">
                            <span>{match.homeTeam.name}</span>
                            <span className="font-bold">{match.homeScore}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>{match.awayTeam.name}</span>
                            <span className="font-bold">{match.awayScore}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No recent matches</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}