import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { triggerMatchUpdate } from '@/lib/pusher'
import { MatchStatus } from '@prisma/client'

export async function POST(
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
        error: 'Only referees can start matches' 
      }, { status: 403 })
    }

    const { id: matchId } = await params

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

    if (match.status !== MatchStatus.SCHEDULED) {
      return NextResponse.json({ 
        error: 'Match cannot be started in its current state' 
      }, { status: 400 })
    }

    // Start the match
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.IN_PROGRESS,
        startedAt: new Date()
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
      message: 'Match started successfully',
      match: updatedMatch
    })
  } catch (error) {
    console.error('Start match error:', error)
    return NextResponse.json(
      { error: 'Failed to start match' },
      { status: 500 }
    )
  }
}