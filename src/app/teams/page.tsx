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
  Users, 
  Search, 
  Plus,
  Trophy,
  User,
  Phone,
  Mail,
  Calendar
} from 'lucide-react'

interface Team {
  id: string
  name: string
  description: string | null
  logo: string | null
  contactEmail: string
  contactPhone: string | null
  createdAt: string
  league: {
    id: string
    name: string
    sport: string
    status: string
  }
  manager: {
    id: string
    name: string
    email: string
  }
  _count: {
    players: number
  }
}

interface TeamsResponse {
  teams: Team[]
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

export default function TeamsPage() {
  const { data: session, status } = useSession()
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showMyTeamsOnly, setShowMyTeamsOnly] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchTeams()
  }, [searchTerm, showMyTeamsOnly, pagination.page, session?.user?.id])

  const fetchTeams = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (showMyTeamsOnly && session?.user?.id) {
        params.append('manager', session.user.id)
      }

      const response = await fetch(`/api/teams?${params}`)
      if (response.ok) {
        const data: TeamsResponse = await response.json()
        
        // Filter by search term on client side for simplicity
        let filteredTeams = data.teams
        if (searchTerm) {
          filteredTeams = data.teams.filter(team =>
            team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.manager.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        
        setTeams(filteredTeams)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error)
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const toggleMyTeams = () => {
    setShowMyTeamsOnly(!showMyTeamsOnly)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Teams</h1>
            <p className="text-gray-600">
              Browse teams across all leagues
            </p>
          </div>
          
          <Button variant="team" asChild className="mt-4 md:mt-0">
            <Link href="/teams/register">
              <Plus className="mr-2 h-4 w-4" />
              Register Team
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams, leagues, or managers..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
          
          {session?.user && (
            <Button
              variant={showMyTeamsOnly ? "team" : "outline"}
              onClick={toggleMyTeams}
            >
              <User className="mr-2 h-4 w-4" />
              {showMyTeamsOnly ? "All Teams" : "My Teams"}
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Teams Grid */}
            {teams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {teams.map((team) => (
                  <Card key={team.id} className="team-card group cursor-pointer">
                    <Link href={`/teams/${team.id}`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-start space-x-3">
                          {team.logo ? (
                            <img
                              src={team.logo}
                              alt={`${team.name} logo`}
                              className="w-12 h-12 object-cover rounded-lg border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                              <Users className="h-6 w-6 text-success-600" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg group-hover:text-success-600 transition-colors">
                              {team.name}
                            </CardTitle>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <span className="text-lg">
                                {SPORT_ICONS[team.league.sport] || '🏆'}
                              </span>
                              <span>{team.league.name}</span>
                            </div>
                          </div>
                        </div>
                        
                        {team.description && (
                          <CardDescription className="line-clamp-2 mt-2">
                            {team.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{team._count.players} players</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Joined {formatDate(team.createdAt)}</span>
                            </div>
                          </div>
                          
                          {/* Manager */}
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>Managed by {team.manager.name}</span>
                          </div>
                          
                          {/* Contact */}
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <span className="truncate">{team.contactEmail}</span>
                            </div>
                            {team.contactPhone && (
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{team.contactPhone}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* League Status */}
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              team.league.status === 'IN_PROGRESS' 
                                ? 'bg-blue-100 text-blue-800'
                                : team.league.status === 'REGISTRATION_OPEN'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {team.league.status.replace('_', ' ')}
                            </span>
                            
                            {session?.user?.id === team.manager.id && (
                              <span className="text-xs font-medium text-success-600">
                                My Team
                              </span>
                            )}
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
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {showMyTeamsOnly ? "No teams found" : "No teams registered yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {showMyTeamsOnly 
                      ? "You haven't registered any teams yet."
                      : searchTerm 
                      ? "Try adjusting your search criteria"
                      : "Be the first to register a team!"}
                  </p>
                  <Button variant="team" asChild>
                    <Link href="/teams/register">
                      <Plus className="mr-2 h-4 w-4" />
                      Register First Team
                    </Link>
                  </Button>
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
                        variant={pageNum === pagination.page ? "team" : "outline"}
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