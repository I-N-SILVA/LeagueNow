"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Calendar, Users, Settings, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const SPORT_TYPES = [
  { value: 'FOOTBALL', label: 'Football', icon: '🏈' },
  { value: 'BASKETBALL', label: 'Basketball', icon: '🏀' },
  { value: 'SOCCER', label: 'Soccer', icon: '⚽' },
  { value: 'VOLLEYBALL', label: 'Volleyball', icon: '🏐' },
  { value: 'TENNIS', label: 'Tennis', icon: '🎾' },
  { value: 'CRICKET', label: 'Cricket', icon: '🏏' },
  { value: 'HOCKEY', label: 'Hockey', icon: '🏒' },
  { value: 'RUGBY', label: 'Rugby', icon: '🏉' },
  { value: 'BASEBALL', label: 'Baseball', icon: '⚾' },
  { value: 'BADMINTON', label: 'Badminton', icon: '🏸' },
]

interface LeagueFormData {
  name: string
  description: string
  sport: string
  startDate: string
  endDate: string
  maxTeams: number
  pointsForWin: number
  pointsForDraw: number
  pointsForLoss: number
}

export default function CreateLeaguePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<LeagueFormData>({
    name: '',
    description: '',
    sport: '',
    startDate: '',
    endDate: '',
    maxTeams: 16,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
  })

  if (status === 'loading') {
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

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  if (session?.user?.role !== 'LEAGUE_ADMIN') {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 container py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
              <CardDescription>
                You need to be a League Administrator to create leagues.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Points') || name === 'maxTeams' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const league = await response.json()
        router.push(`/leagues/${league.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create league')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New League</h1>
                <p className="text-gray-600">Set up a new sports league with custom settings</p>
              </div>
            </div>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>League Configuration</CardTitle>
              <CardDescription>
                Configure your league settings. You can modify most of these later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Trophy className="mr-2 h-5 w-5" />
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        League Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="e.g., Spring Soccer League 2024"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        placeholder="Brief description of your league..."
                        value={formData.description}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="sport" className="block text-sm font-medium mb-2">
                        Sport *
                      </label>
                      <select
                        id="sport"
                        name="sport"
                        required
                        value={formData.sport}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select a sport</option>
                        {SPORT_TYPES.map(sport => (
                          <option key={sport.value} value={sport.value}>
                            {sport.icon} {sport.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="maxTeams" className="block text-sm font-medium mb-2">
                        Maximum Teams
                      </label>
                      <Input
                        id="maxTeams"
                        name="maxTeams"
                        type="number"
                        min="4"
                        max="32"
                        value={formData.maxTeams}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                        Start Date *
                      </label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        required
                        min={today}
                        value={formData.startDate}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                        End Date (Optional)
                      </label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        min={formData.startDate || today}
                        value={formData.endDate}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Scoring System */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Scoring System
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="pointsForWin" className="block text-sm font-medium mb-2">
                        Points for Win
                      </label>
                      <Input
                        id="pointsForWin"
                        name="pointsForWin"
                        type="number"
                        min="0"
                        max="10"
                        value={formData.pointsForWin}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="pointsForDraw" className="block text-sm font-medium mb-2">
                        Points for Draw
                      </label>
                      <Input
                        id="pointsForDraw"
                        name="pointsForDraw"
                        type="number"
                        min="0"
                        max="10"
                        value={formData.pointsForDraw}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="pointsForLoss" className="block text-sm font-medium mb-2">
                        Points for Loss
                      </label>
                      <Input
                        id="pointsForLoss"
                        name="pointsForLoss"
                        type="number"
                        min="0"
                        max="10"
                        value={formData.pointsForLoss}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Standard soccer scoring: Win=3, Draw=1, Loss=0
                  </p>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" asChild disabled={isLoading}>
                    <Link href="/dashboard">Cancel</Link>
                  </Button>
                  <Button type="submit" variant="sports" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create League'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}