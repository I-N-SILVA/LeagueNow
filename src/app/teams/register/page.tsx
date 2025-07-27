"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/ui/file-upload'
import { Users, ArrowLeft, Upload, Trophy } from 'lucide-react'
import Link from 'next/link'

interface League {
  id: string
  name: string
  sport: string
  status: string
  maxTeams: number
  _count: {
    teams: number
  }
}

interface TeamFormData {
  name: string
  description: string
  contactEmail: string
  contactPhone: string
  logo: string
  leagueId: string
}

function RegisterTeamPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedLeagueId = searchParams.get('league')
  
  const [leagues, setLeagues] = useState<League[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(true)
  const [error, setError] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    contactEmail: session?.user?.email || '',
    contactPhone: '',
    logo: '',
    leagueId: preselectedLeagueId || '',
  })

  useEffect(() => {
    if (session?.user?.email) {
      setFormData(prev => ({ ...prev, contactEmail: session.user.email }))
    }
  }, [session?.user?.email])

  useEffect(() => {
    fetchAvailableLeagues()
  }, [])

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

  const fetchAvailableLeagues = async () => {
    try {
      const response = await fetch('/api/leagues?status=REGISTRATION_OPEN')
      if (response.ok) {
        const data = await response.json()
        setLeagues(data.leagues)
      }
    } catch (error) {
      console.error('Failed to fetch leagues:', error)
    } finally {
      setIsLoadingLeagues(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoUpload = (result: { url: string; publicId: string }) => {
    setLogoUrl(result.url)
    setFormData(prev => ({ ...prev, logo: result.url }))
  }

  const handleLogoError = (error: string) => {
    setError(`Logo upload failed: ${error}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          logo: logoUrl || null,
        }),
      })

      if (response.ok) {
        const team = await response.json()
        router.push(`/teams/${team.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to register team')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedLeague = leagues.find(league => league.id === formData.leagueId)

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
              <div className="p-2 bg-success-100 rounded-lg">
                <Users className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Register Team</h1>
                <p className="text-gray-600">Join a league and start competing</p>
              </div>
            </div>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Team Registration</CardTitle>
              <CardDescription>
                Fill out your team details to join a league
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* League Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Trophy className="mr-2 h-5 w-5" />
                    League Selection
                  </h3>
                  
                  {isLoadingLeagues ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : leagues.length > 0 ? (
                    <div>
                      <label htmlFor="leagueId" className="block text-sm font-medium mb-2">
                        Select League *
                      </label>
                      <select
                        id="leagueId"
                        name="leagueId"
                        required
                        value={formData.leagueId}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Choose a league</option>
                        {leagues.map(league => (
                          <option key={league.id} value={league.id}>
                            {league.name} ({league.sport}) - {league._count.teams}/{league.maxTeams} teams
                          </option>
                        ))}
                      </select>
                      
                      {selectedLeague && (
                        <div className="mt-2 p-3 bg-primary/5 rounded-md border border-primary/20">
                          <p className="text-sm text-primary font-medium">
                            {selectedLeague.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedLeague.sport} • {selectedLeague._count.teams}/{selectedLeague.maxTeams} teams registered
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Card className="border-destructive/20 bg-destructive/5">
                      <CardContent className="pt-4">
                        <p className="text-sm text-destructive">
                          No leagues are currently accepting registrations.
                        </p>
                        <Button variant="outline" asChild className="mt-2">
                          <Link href="/leagues">Browse All Leagues</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Team Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Team Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Team Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="e.g., Thunder Hawks"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium mb-2">
                        Team Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        placeholder="Brief description of your team..."
                        value={formData.description}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="contactEmail" className="block text-sm font-medium mb-2">
                        Contact Email *
                      </label>
                      <Input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        required
                        placeholder="team@example.com"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="contactPhone" className="block text-sm font-medium mb-2">
                        Contact Phone
                      </label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Team Logo */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Upload className="mr-2 h-5 w-5" />
                    Team Logo
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Upload Logo (Optional)
                    </label>
                    {logoUrl ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={logoUrl}
                            alt="Team logo"
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <div>
                            <p className="text-sm font-medium">Logo uploaded successfully</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setLogoUrl('')
                                setFormData(prev => ({ ...prev, logo: '' }))
                              }}
                              disabled={isLoading}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <FileUpload
                        onUpload={handleLogoUpload}
                        onError={handleLogoError}
                        accept="image/*"
                        maxSize={5}
                        folder="teams"
                        type="image"
                      />
                    )}
                  </div>
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
                  <Button 
                    type="submit" 
                    variant="team" 
                    disabled={isLoading || leagues.length === 0}
                  >
                    {isLoading ? 'Registering...' : 'Register Team'}
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

export default function RegisterTeamPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterTeamPageContent />
    </Suspense>
  )
}