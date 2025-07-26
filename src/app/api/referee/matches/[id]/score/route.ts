import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { triggerMatchUpdate } from '@/lib/pusher'
import { MatchStatus } from '@prisma/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'REFEREE') {
      return NextResponse.json({ 
        error: 'Only referees can update scores' 
      }, { status: 403 })
    }

    const { id: matchId } = await params
    const { homeScore, awayScore, notes } = await request.json()

    // Validate scores
    if (typeof homeScore !== 'number' || typeof awayScore !== 'number' || 
        homeScore < 0 || awayScore < 0) {
      return NextResponse.json({ 
        error: 'Invalid score values' 
      }, { status: 400 })
    }

    // Verify referee is assigned to this match
    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
        refereeId: session.user.id
      }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    if (match.status !== MatchStatus.IN_PROGRESS) {
      return NextResponse.json({ 
        error: 'Can only update scores for matches in progress' 
      }, { status: 400 })
    }

    // Update the match score
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        homeScore,
        awayScore,
        notes: notes || null
      },
      include: {
        homeTeam: {
          select: { id: true, name: true }
        },
        awayTeam: {
          select: { id: true, name: true }
        }
      }
    })

    // Trigger real-time update
    await triggerMatchUpdate(matchId, {
      matchId,
      homeScore: updatedMatch.homeScore,
      awayScore: updatedMatch.awayScore,
      status: updatedMatch.status,
      updatedAt: updatedMatch.updatedAt.toISOString()
    })

    return NextResponse.json({
      message: 'Score updated successfully',
      match: updatedMatch
    })
  } catch (error) {
    console.error('Update score error:', error)
    return NextResponse.json(
      { error: 'Failed to update score' },
      { status: 500 }
    )
  }
}