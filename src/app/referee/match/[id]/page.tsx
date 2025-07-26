"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMatchUpdates } from '@/hooks/use-pusher'
import { 
  Trophy, 
  ArrowLeft, 
  Play,
  Pause,
  Square,
  Plus,
  Minus,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Save
} from 'lucide-react'

interface MatchDetail {
  id: string
  round: number
  matchNumber: number
  scheduledAt: string
  startedAt: string | null
  completedAt: string | null
  status: string
  homeScore: number
  awayScore: number
  notes: string | null
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

export default function RefereeMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [matchId, setMatchId] = useState<string>('')
  const [match, setMatch] = useState<MatchDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [notes, setNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [matchTimer, setMatchTimer] = useState<number>(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  useEffect(() => {
    const initializeParams = async () => {
      const { id } = await params
      setMatchId(id)
    }
    initializeParams()
  }, [params])

  useEffect(() => {
    if (matchId) {
      fetchMatch()
    }
  }, [matchId])

  useEffect(() => {
    if (match) {
      setHomeScore(match.homeScore)
      setAwayScore(match.awayScore)
      setNotes(match.notes || '')
      
      // Calculate match time if in progress
      if (match.status === 'IN_PROGRESS' && match.startedAt) {
        const startTime = new Date(match.startedAt).getTime()
        const currentTime = Date.now()
        setMatchTimer(Math.floor((currentTime - startTime) / 1000))
        setIsTimerRunning(true)
      }
    }
  }, [match])

  // Real-time match updates
  useMatchUpdates(matchId, (data: unknown) => {
    console.log('Match update received:', data)
    fetchMatch() // Refresh match data when updates are received
  })

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined

    if (isTimerRunning) {
      interval = setInterval(() => {
        setMatchTimer(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isTimerRunning])

  const fetchMatch = async () => {
    if (!matchId) return
    
    try {
      const response = await fetch(`/api/referee/matches/${matchId}`)
      if (response.ok) {
        const data = await response.json()
        setMatch(data)
      } else if (response.status === 404) {
        router.push('/referee')
      }
    } catch (error) {
      console.error('Failed to fetch match:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartMatch = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/referee/matches/${matchId}/start`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setIsTimerRunning(true)
        await fetchMatch()
      }
    } catch (error) {
      console.error('Failed to start match:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePauseMatch = async () => {
    setIsTimerRunning(!isTimerRunning)
  }

  const handleCompleteMatch = async () => {
    if (!confirm('Are you sure you want to complete this match? This cannot be undone.')) {
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/referee/matches/${matchId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeScore,
          awayScore,
          notes
        })
      })
      
      if (response.ok) {
        setIsTimerRunning(false)
        await fetchMatch()
      }
    } catch (error) {
      console.error('Failed to complete match:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateScore = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/referee/matches/${matchId}/score`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeScore,
          awayScore,
          notes
        })
      })
      
      if (response.ok) {
        await fetchMatch()
      }
    } catch (error) {
      console.error('Failed to update score:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  if (!session || session.user.role !== "REFEREE" || !match) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 container py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
              <CardDescription>
                You don&apos;t have permission to manage this match.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/referee">Back to Referee Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container py-4 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/referee">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {match.league.name} - Round {match.round}
            </h1>
            <p className="text-gray-600">{formatDateTime(match.scheduledAt)}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Match Status & Timer */}
          <Card className="match-card">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
                <div className={`px-4 py-2 rounded-full text-lg font-medium flex items-center space-x-2 ${
                  match.status === 'SCHEDULED' 
                    ? 'bg-blue-100 text-blue-800'
                    : match.status === 'IN_PROGRESS'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {match.status === 'SCHEDULED' && <Clock className="h-5 w-5" />}
                  {match.status === 'IN_PROGRESS' && <Play className="h-5 w-5" />}
                  {match.status === 'COMPLETED' && <CheckCircle className="h-5 w-5" />}
                  <span>{match.status.replace('_', ' ')}</span>
                </div>
                
                {match.status === 'IN_PROGRESS' && (
                  <div className="text-3xl font-bold text-primary">
                    {formatTime(matchTimer)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Score Display */}
          <Card className="sport-card">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 items-center text-center">
                {/* Home Team */}
                <div className="space-y-2">
                  {match.homeTeam.logo && (
                    <img
                      src={match.homeTeam.logo}
                      alt={match.homeTeam.name}
                      className="w-16 h-16 mx-auto object-cover rounded-lg"
                    />
                  )}
                  <h3 className="font-semibold text-lg">{match.homeTeam.name}</h3>
                  <div className="text-4xl font-bold text-primary">{homeScore}</div>
                </div>
                
                {/* VS */}
                <div className="text-2xl font-bold text-muted-foreground">VS</div>
                
                {/* Away Team */}
                <div className="space-y-2">
                  {match.awayTeam.logo && (
                    <img
                      src={match.awayTeam.logo}
                      alt={match.awayTeam.name}
                      className="w-16 h-16 mx-auto object-cover rounded-lg"
                    />
                  )}
                  <h3 className="font-semibold text-lg">{match.awayTeam.name}</h3>
                  <div className="text-4xl font-bold text-primary">{awayScore}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Match Controls */}
          {match.status !== 'COMPLETED' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5" />
                  Match Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Home Team Score */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{match.homeTeam.name} Score</label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                        disabled={homeScore === 0 || isUpdating}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={homeScore}
                        onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                        className="text-center text-xl font-bold"
                        min="0"
                        disabled={isUpdating}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setHomeScore(homeScore + 1)}
                        disabled={isUpdating}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Away Team Score */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{match.awayTeam.name} Score</label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                        disabled={awayScore === 0 || isUpdating}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={awayScore}
                        onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                        className="text-center text-xl font-bold"
                        min="0"
                        disabled={isUpdating}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setAwayScore(awayScore + 1)}
                        disabled={isUpdating}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Match Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Match Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add match notes, events, or observations..."
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isUpdating}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-3">
                  {match.status === 'SCHEDULED' && (
                    <Button
                      variant="sports"
                      onClick={handleStartMatch}
                      disabled={isUpdating}
                      className="flex-1"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {isUpdating ? 'Starting...' : 'Start Match'}
                    </Button>
                  )}

                  {match.status === 'IN_PROGRESS' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handlePauseMatch}
                        disabled={isUpdating}
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        {isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
                      </Button>
                      
                      <Button
                        variant="secondary"
                        onClick={handleUpdateScore}
                        disabled={isUpdating}
                        className="flex-1"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isUpdating ? 'Updating...' : 'Update Score'}
                      </Button>
                      
                      <Button
                        variant="match"
                        onClick={handleCompleteMatch}
                        disabled={isUpdating}
                      >
                        <Square className="mr-2 h-4 w-4" />
                        Complete Match
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Match Information */}
          <Card>
            <CardHeader>
              <CardTitle>Match Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">League:</span> {match.league.name}
                </div>
                <div>
                  <span className="font-medium">Sport:</span> {match.league.sport}
                </div>
                <div>
                  <span className="font-medium">Round:</span> {match.round}
                </div>
                <div>
                  <span className="font-medium">Match:</span> #{match.matchNumber}
                </div>
                {match.startedAt && (
                  <div>
                    <span className="font-medium">Started:</span> {formatDateTime(match.startedAt)}
                  </div>
                )}
                {match.completedAt && (
                  <div>
                    <span className="font-medium">Completed:</span> {formatDateTime(match.completedAt)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}