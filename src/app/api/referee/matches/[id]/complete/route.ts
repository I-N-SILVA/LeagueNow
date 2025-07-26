import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { triggerMatchUpdate, triggerStandingsUpdate } from '@/lib/pusher'
import { updateLeagueStandings } from '@/lib/scheduling'
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
        error: 'Only referees can complete matches' 
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
        error: 'Can only complete matches that are in progress' 
      }, { status: 400 })
    }

    // Complete the match
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.COMPLETED,
        homeScore,
        awayScore,
        notes: notes || null,
        completedAt: new Date()
      },
      include: {
        homeTeam: {
          select: { id: true, name: true }
        },
        awayTeam: {
          select: { id: true, name: true }
        },
        league: {
          select: { id: true, name: true }
        }
      }
    })

    // Update league standings
    await updateLeagueStandings(match.leagueId)

    // Get updated standings for real-time update
    const standings = await prisma.standing.findMany({
      where: { leagueId: match.leagueId },
      include: {
        team: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' }
      ]
    })

    // Trigger real-time updates
    await Promise.all([
      triggerMatchUpdate(matchId, {
        matchId,
        homeScore: updatedMatch.homeScore,
        awayScore: updatedMatch.awayScore,
        status: updatedMatch.status,
        updatedAt: updatedMatch.updatedAt.toISOString()
      }),
      triggerStandingsUpdate(match.leagueId, {
        leagueId: match.leagueId,
        standings: standings.map(standing => ({
          teamId: standing.teamId,
          teamName: standing.team.name,
          position: standing.position,
          played: standing.played,
          won: standing.won,
          drawn: standing.drawn,
          lost: standing.lost,
          points: standing.points,
          goalDifference: standing.goalDifference
        }))
      })
    ])

    return NextResponse.json({
      message: 'Match completed successfully',
      match: updatedMatch
    })
  } catch (error) {
    console.error('Complete match error:', error)
    return NextResponse.json(
      { error: 'Failed to complete match' },
      { status: 500 }
    )
  }
}