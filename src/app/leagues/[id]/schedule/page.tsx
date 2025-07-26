"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar, 
  ArrowLeft, 
  Clock,
  Users,
  Settings,
  Trash2,
  Play,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

interface League {
  id: string
  name: string
  sport: string
  status: string
  adminId: string
  startDate: string
  _count: {
    teams: number
    matches: number
  }
}

interface Match {
  id: string
  round: number
  matchNumber: number
  scheduledAt: string
  status: string
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
  referee?: {
    id: string
    name: string
    email: string
  }
}

interface ScheduleFormData {
  startDate: string
  matchDurationMinutes: number
  breakBetweenMatches: number
  matchesPerDay: number
  excludeDays: number[]
  preferredStartTime: string
}

export default function LeagueSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leagueId, setLeagueId] = useState<string>('')
  const [league, setLeague] = useState<League | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [rounds, setRounds] = useState<Record<number, Match[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<ScheduleFormData>({
    startDate: '',
    matchDurationMinutes: 90,
    breakBetweenMatches: 30,
    matchesPerDay: 4,
    excludeDays: [0], // Sunday
    preferredStartTime: '10:00'
  })

  useEffect(() => {
    const initializeParams = async () => {
      const { id } = await params
      setLeagueId(id)
    }
    initializeParams()
  }, [params])

  useEffect(() => {
    if (leagueId) {
      fetchLeague()
      fetchSchedule()
    }
  }, [leagueId])

  useEffect(() => {
    if (league?.startDate) {
      setFormData(prev => ({
        ...prev,
        startDate: new Date(league.startDate).toISOString().split('T')[0]
      }))
    }
  }, [league?.startDate])

  const fetchLeague = async () => {
    if (!leagueId) return
    try {
      const response = await fetch(`/api/leagues/${leagueId}`)
      if (response.ok) {
        const data = await response.json()
        setLeague(data)
      }
    } catch (error) {
      console.error('Failed to fetch league:', error)
    }
  }

  const fetchSchedule = async () => {
    if (!leagueId) return
    try {
      const response = await fetch(`/api/leagues/${leagueId}/schedule`)
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches || [])
        setRounds(data.rounds || {})
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (name === 'excludeDays') {
      const checkbox = e.target as HTMLInputElement
      setFormData(prev => ({
        ...prev,
        excludeDays: checkbox.checked 
          ? [...prev.excludeDays, parseInt(value)]
          : prev.excludeDays.filter(day => day !== parseInt(value))
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) || 0 : value
      }))
    }
  }

  const handleGenerateSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch(`/api/leagues/${leagueId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches)
        setRounds(data.rounds || {})
        setShowForm(false)
        await fetchLeague() // Refresh league status
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to generate schedule')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteSchedule = async () => {
    if (!confirm('Are you sure you want to delete the entire schedule? This cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/leagues/${leagueId}/schedule`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMatches([])
        setRounds({})
        await fetchLeague() // Refresh league status
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete schedule')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
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

  const isAdmin = session?.user?.id === league?.adminId

  if (status === 'loading' || isLoading) {
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
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/leagues">Back to Leagues</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href={`/leagues/${leagueId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to League
              </Link>
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {league.name} - Schedule
                </h1>
                <p className="text-gray-600">
                  Manage matches and fixtures for your league
                </p>
              </div>
              
              {isAdmin && (
                <div className="flex space-x-2">
                  {matches.length > 0 ? (
                    <Button
                      variant="destructive"
                      onClick={handleDeleteSchedule}
                      disabled={isDeleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting ? 'Deleting...' : 'Delete Schedule'}
                    </Button>
                  ) : (
                    <Button
                      variant="sports"
                      onClick={() => setShowForm(true)}
                      disabled={league._count.teams < 2}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Generate Schedule
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {error && (
            <Card className="mb-6 border-destructive/20 bg-destructive/5">
              <CardContent className="pt-4">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Schedule Generation Form */}
          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Schedule Configuration
                </CardTitle>
                <CardDescription>
                  Configure the parameters for generating your league schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateSchedule} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                        Schedule Start Date *
                      </label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={handleInputChange}
                        disabled={isGenerating}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="preferredStartTime" className="block text-sm font-medium mb-2">
                        Preferred Start Time
                      </label>
                      <Input
                        id="preferredStartTime"
                        name="preferredStartTime"
                        type="time"
                        value={formData.preferredStartTime}
                        onChange={handleInputChange}
                        disabled={isGenerating}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="matchDurationMinutes" className="block text-sm font-medium mb-2">
                        Match Duration (minutes)
                      </label>
                      <Input
                        id="matchDurationMinutes"
                        name="matchDurationMinutes"
                        type="number"
                        min="30"
                        max="180"
                        value={formData.matchDurationMinutes}
                        onChange={handleInputChange}
                        disabled={isGenerating}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="breakBetweenMatches" className="block text-sm font-medium mb-2">
                        Break Between Matches (minutes)
                      </label>
                      <Input
                        id="breakBetweenMatches"
                        name="breakBetweenMatches"
                        type="number"
                        min="0"
                        max="120"
                        value={formData.breakBetweenMatches}
                        onChange={handleInputChange}
                        disabled={isGenerating}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="matchesPerDay" className="block text-sm font-medium mb-2">
                        Maximum Matches Per Day
                      </label>
                      <Input
                        id="matchesPerDay"
                        name="matchesPerDay"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.matchesPerDay}
                        onChange={handleInputChange}
                        disabled={isGenerating}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Exclude Days (no matches scheduled)
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                      {dayNames.map((day, index) => (
                        <label key={index} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="excludeDays"
                            value={index}
                            checked={formData.excludeDays.includes(index)}
                            onChange={handleInputChange}
                            disabled={isGenerating}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{day.slice(0, 3)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      disabled={isGenerating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="sports" disabled={isGenerating}>
                      {isGenerating ? 'Generating...' : 'Generate Schedule'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* No Schedule State */}
          {matches.length === 0 && !showForm && (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Schedule Generated</h3>
                <p className="text-muted-foreground mb-4">
                  {league._count.teams < 2 
                    ? `At least 2 teams are required to generate a schedule. Currently: ${league._count.teams} teams.`
                    : 'Generate an automated round-robin schedule for your league.'
                  }
                </p>
                {isAdmin && league._count.teams >= 2 && (
                  <Button variant="sports" onClick={() => setShowForm(true)}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Generate Schedule
                  </Button>
                )}
                {league._count.teams < 2 && (
                  <Button variant="outline" asChild>
                    <Link href={`/leagues/${leagueId}`}>
                      <Users className="mr-2 h-4 w-4" />
                      Manage Teams
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Schedule Display */}
          {matches.length > 0 && (
            <div className="space-y-6">
              {/* Schedule Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{matches.length}</div>
                      <p className="text-sm text-muted-foreground">Total Matches</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success-600">{Object.keys(rounds).length}</div>
                      <p className="text-sm text-muted-foreground">Rounds</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-warning-600">{league._count.teams}</div>
                      <p className="text-sm text-muted-foreground">Teams</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {matches.filter(m => m.status === 'COMPLETED').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rounds */}
              {Object.entries(rounds).map(([roundNumber, roundMatches]) => (
                <Card key={roundNumber}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Play className="mr-2 h-5 w-5" />
                      Round {roundNumber}
                    </CardTitle>
                    <CardDescription>
                      {roundMatches.length} matches
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {roundMatches.map((match) => (
                        <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="text-sm text-muted-foreground min-w-[80px]">
                              Match {match.matchNumber}
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              {/* Home Team */}
                              <div className="flex items-center space-x-2 min-w-[120px] justify-end">
                                <span className="font-medium">{match.homeTeam.name}</span>
                                {match.homeTeam.logo && (
                                  <img
                                    src={match.homeTeam.logo}
                                    alt={match.homeTeam.name}
                                    className="w-6 h-6 object-cover rounded"
                                  />
                                )}
                              </div>
                              
                              <div className="text-muted-foreground">vs</div>
                              
                              {/* Away Team */}
                              <div className="flex items-center space-x-2 min-w-[120px]">
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
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-sm text-muted-foreground text-right">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(match.scheduledAt)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(match.scheduledAt)}</span>
                              </div>
                            </div>
                            
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              match.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-800'
                                : match.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {match.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}