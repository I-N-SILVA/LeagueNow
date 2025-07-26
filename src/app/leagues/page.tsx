"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Trophy, 
  Search, 
  Filter, 
  Users, 
  Calendar,
  MapPin,
  Plus,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react'

interface League {
  id: string
  name: string
  description: string
  sport: string
  startDate: string
  endDate: string | null
  status: string
  maxTeams: number
  admin: {
    id: string
    name: string
    email: string
  }
  _count: {
    teams: number
    matches: number
  }
}

interface LeaguesResponse {
  leagues: League[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

const SPORT_ICONS: Record<string, string> = {
  FOOTBALL: '🏈',
  BASKETBALL: '🏀',
  SOCCER: '⚽',
  VOLLEYBALL: '🏐',
  TENNIS: '🎾',
  CRICKET: '🏏',
  HOCKEY: '🏒',
  RUGBY: '🏉',
  BASEBALL: '⚾',
  BADMINTON: '🏸',
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  REGISTRATION_OPEN: 'bg-green-100 text-green-800',
  REGISTRATION_CLOSED: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function LeaguesPage() {
  const { data: session, status } = useSession()
  const [leagues, setLeagues] = useState<League[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSport, setSelectedSport] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchLeagues()
  }, [searchTerm, selectedSport, selectedStatus, pagination.page])

  const fetchLeagues = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedSport) params.append('sport', selectedSport)
      if (selectedStatus) params.append('status', selectedStatus)

      const response = await fetch(`/api/leagues?${params}`)
      if (response.ok) {
        const data: LeaguesResponse = await response.json()
        setLeagues(data.leagues)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch leagues:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Clock className="h-4 w-4" />
      case 'REGISTRATION_OPEN': return <Users className="h-4 w-4" />
      case 'IN_PROGRESS': return <Trophy className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSportFilter = (sport: string) => {
    setSelectedSport(sport === selectedSport ? '' : sport)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status === selectedStatus ? '' : status)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Leagues</h1>
            <p className="text-gray-600">
              Find and join sports leagues in your area
            </p>
          </div>
          
          {session?.user?.role === 'LEAGUE_ADMIN' && (
            <Button variant="sports" asChild className="mt-4 md:mt-0">
              <Link href="/leagues/create">
                <Plus className="mr-2 h-4 w-4" />
                Create League
              </Link>
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leagues..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {/* Sport Filter */}
            <select
              value={selectedSport}
              onChange={(e) => handleSportFilter(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All Sports</option>
              {Object.entries(SPORT_ICONS).map(([sport, icon]) => (
                <option key={sport} value={sport}>
                  {icon} {sport.replace('_', ' ')}
                </option>
              ))}
            </select>
            
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All Statuses</option>
              <option value="REGISTRATION_OPEN">Open Registration</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Leagues Grid */}
            {leagues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {leagues.map((league) => (
                  <Card key={league.id} className="sport-card group cursor-pointer">
                    <Link href={`/leagues/${league.id}`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">
                              {SPORT_ICONS[league.sport] || '🏆'}
                            </span>
                            <div>
                              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {league.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {league.sport.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                          
                          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${STATUS_COLORS[league.status]}`}>
                            {getStatusIcon(league.status)}
                            <span>{league.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                        
                        {league.description && (
                          <CardDescription className="line-clamp-2">
                            {league.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{league._count.teams}/{league.maxTeams} teams</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{league._count.matches} matches</span>
                            </div>
                          </div>
                          
                          {/* Dates */}
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Starts: {formatDate(league.startDate)}</span>
                            {league.endDate && (
                              <span>Ends: {formatDate(league.endDate)}</span>
                            )}
                          </div>
                          
                          {/* Admin */}
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Star className="h-4 w-4" />
                            <span>Organized by {league.admin.name}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No leagues found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedSport || selectedStatus
                      ? "Try adjusting your search filters"
                      : "Be the first to create a league in your area!"}
                  </p>
                  {session?.user?.role === 'LEAGUE_ADMIN' && (
                    <Button variant="sports" asChild>
                      <Link href="/leagues/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First League
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.page - 2) + i
                    if (pageNum > pagination.pages) return null
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? "sports" : "outline"}
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}