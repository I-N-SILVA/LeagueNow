"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/ui/file-upload'
import { 
  Video, 
  Trophy,
  Users,
  Clock,
  Upload,
  Heart,
  Eye,
  Share2,
  Calendar
} from 'lucide-react'

interface MatchInfo {
  id: string
  round: number
  scheduledAt: string
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
  qrCodeScans: number
}

interface FanVideo {
  id: string
  videoUrl: string
  thumbnailUrl: string | null
  title: string | null
  description: string | null
  uploaderName: string | null
  createdAt: string
}

interface VideoFormData {
  title: string
  description: string
  uploaderName: string
  uploaderEmail: string
}

export default function FanEngagementPage({ params }: { params: Promise<{ matchId: string }> }) {
  const router = useRouter()
  const [matchId, setMatchId] = useState<string>('')
  const [match, setMatch] = useState<MatchInfo | null>(null)
  const [videos, setVideos] = useState<FanVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('')
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    uploaderName: '',
    uploaderEmail: ''
  })

  useEffect(() => {
    const initializeParams = async () => {
      const { matchId: id } = await params
      setMatchId(id)
    }
    initializeParams()
  }, [params])

  useEffect(() => {
    if (matchId) {
      fetchMatchInfo()
      fetchFanVideos()
      incrementQRScan()
    }
  }, [matchId])

  const fetchMatchInfo = async () => {
    try {
      const response = await fetch(`/api/fan/matches/${matchId}`)
      if (response.ok) {
        const data = await response.json()
        setMatch(data)
      } else if (response.status === 404) {
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to fetch match info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFanVideos = async () => {
    try {
      const response = await fetch(`/api/fan/matches/${matchId}/videos`)
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos || [])
      }
    } catch (error) {
      console.error('Failed to fetch fan videos:', error)
    }
  }

  const incrementQRScan = async () => {
    try {
      await fetch(`/api/fan/matches/${matchId}/scan`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Failed to increment QR scan:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleVideoUpload = (result: { url: string; publicId: string }) => {
    setUploadedVideoUrl(result.url)
  }

  const handleVideoError = (error: string) => {
    console.error('Video upload error:', error)
  }

  const handleSubmitVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadedVideoUrl) return

    setIsUploading(true)
    try {
      const response = await fetch(`/api/fan/matches/${matchId}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: uploadedVideoUrl,
          title: formData.title || null,
          description: formData.description || null,
          uploaderName: formData.uploaderName || null,
          uploaderEmail: formData.uploaderEmail || null
        })
      })

      if (response.ok) {
        setFormData({
          title: '',
          description: '',
          uploaderName: '',
          uploaderEmail: ''
        })
        setUploadedVideoUrl('')
        await fetchFanVideos()
      }
    } catch (error) {
      console.error('Failed to submit video:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
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

  if (!match) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 container py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-destructive">Match Not Found</CardTitle>
              <CardDescription>
                The match you&apos;re looking for doesn&apos;t exist or isn&apos;t available for fan engagement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/')}>
                Back to Home
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
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Match Header */}
          <Card className="sport-card">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {match.league.name}
                </h1>
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(match.status)}`}>
                  {match.status.replace('_', ' ')}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center text-center mb-6">
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
                  <div className="text-3xl font-bold text-primary">{match.homeScore}</div>
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
                  <div className="text-3xl font-bold text-primary">{match.awayScore}</div>
                </div>
              </div>

              <div className="flex justify-center items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(match.scheduledAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(match.scheduledAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{match.qrCodeScans} scans</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Welcome Message */}
          <Card className="team-gradient text-white">
            <CardContent className="p-6 text-center">
              <Video className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Share Your Match Experience!</h2>
              <p className="text-white/90">
                Capture and share your favorite moments from this match. Your videos help bring the excitement to fans who couldn&apos;t be here!
              </p>
            </CardContent>
          </Card>

          {/* Video Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload Your Video
              </CardTitle>
              <CardDescription>
                Share your match highlights with fellow fans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitVideo} className="space-y-4">
                {!uploadedVideoUrl ? (
                  <FileUpload
                    onUpload={handleVideoUpload}
                    onError={handleVideoError}
                    accept="video/*"
                    maxSize={50}
                    folder="fan-videos"
                    type="video"
                  />
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Video className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">Video uploaded successfully!</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">Fill out the details below and submit to share with other fans.</p>
                  </div>
                )}

                {uploadedVideoUrl && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-2">
                          Video Title (Optional)
                        </label>
                        <Input
                          id="title"
                          name="title"
                          type="text"
                          placeholder="e.g., Amazing goal in 2nd half!"
                          value={formData.title}
                          onChange={handleInputChange}
                          disabled={isUploading}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="uploaderName" className="block text-sm font-medium mb-2">
                          Your Name (Optional)
                        </label>
                        <Input
                          id="uploaderName"
                          name="uploaderName"
                          type="text"
                          placeholder="Your name"
                          value={formData.uploaderName}
                          onChange={handleInputChange}
                          disabled={isUploading}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Describe what happens in your video..."
                        value={formData.description}
                        onChange={handleInputChange}
                        disabled={isUploading}
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label htmlFor="uploaderEmail" className="block text-sm font-medium mb-2">
                        Email (Optional)
                      </label>
                      <Input
                        id="uploaderEmail"
                        name="uploaderEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.uploaderEmail}
                        onChange={handleInputChange}
                        disabled={isUploading}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        We&apos;ll only use this to contact you about your video if needed
                      </p>
                    </div>

                    <Button type="submit" variant="team" disabled={isUploading} className="w-full">
                      {isUploading ? 'Submitting...' : 'Share Video'}
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Fan Videos Gallery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="mr-2 h-5 w-5" />
                Fan Videos ({videos.length})
              </CardTitle>
              <CardDescription>
                Videos shared by fans at this match
              </CardDescription>
            </CardHeader>
            <CardContent>
              {videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <div key={video.id} className="space-y-2">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <video
                          src={video.videoUrl}
                          poster={video.thumbnailUrl || undefined}
                          controls
                          className="w-full h-full object-cover"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                      
                      {video.title && (
                        <h4 className="font-medium text-sm">{video.title}</h4>
                      )}
                      
                      {video.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {video.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {video.uploaderName && (
                          <span>by {video.uploaderName}</span>
                        )}
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to share a video from this match!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share Section */}
          <Card className="bg-gradient-to-r from-warning-500 to-secondary-500 text-white">
            <CardContent className="p-6 text-center">
              <Share2 className="h-8 w-8 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Share This Match</h3>
              <p className="mb-4 text-white/90">
                Invite other fans to share their videos and join the conversation!
              </p>
              <Button 
                variant="outline" 
                className="bg-white text-gray-900 hover:bg-gray-100"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
                      text: 'Check out this match and share your videos!',
                      url: window.location.href
                    })
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                  }
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Match
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}