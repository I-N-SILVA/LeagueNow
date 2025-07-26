import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params

    // Verify match exists
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: { id: true }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Get all approved fan videos for this match
    const videos = await prisma.fanVideo.findMany({
      where: { 
        matchId,
        approved: true
      },
      select: {
        id: true,
        videoUrl: true,
        thumbnailUrl: true,
        title: true,
        description: true,
        uploaderName: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      videos: videos.map(video => ({
        ...video,
        createdAt: video.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Get fan videos error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params
    const { videoUrl, title, description, uploaderName, uploaderEmail } = await request.json()

    // Validate required fields
    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
    }

    // Verify match exists
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: { id: true }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Create fan video entry
    const fanVideo = await prisma.fanVideo.create({
      data: {
        matchId,
        videoUrl,
        title: title || null,
        description: description || null,
        uploaderName: uploaderName || null,
        uploaderEmail: uploaderEmail || null,
        approved: true // Auto-approve for now - in production, this might require moderation
      },
      select: {
        id: true,
        videoUrl: true,
        thumbnailUrl: true,
        title: true,
        description: true,
        uploaderName: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Video uploaded successfully',
      video: {
        ...fanVideo,
        createdAt: fanVideo.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Upload fan video error:', error)
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    )
  }
}