import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leagueId } = await params

    // Get league info
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        _count: {
          select: {
            teams: true,
            matches: true
          }
        },
        matches: {
          where: {
            status: 'COMPLETED'
          },
          select: {
            id: true
          }
        }
      }
    })

    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }

    // Get standings
    const standings = await prisma.standing.findMany({
      where: { leagueId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      },
      orderBy: [
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' }
      ]
    })

    return NextResponse.json({
      league: {
        id: league.id,
        name: league.name,
        sport: league.sport,
        status: league.status,
        startDate: league.startDate.toISOString(),
        endDate: league.endDate?.toISOString() || null,
        totalTeams: league._count.teams,
        totalMatches: league._count.matches,
        completedMatches: league.matches.length
      },
      standings: standings.map((standing, index) => ({
        teamId: standing.teamId,
        teamName: standing.team.name,
        position: index + 1,
        played: standing.played,
        won: standing.won,
        drawn: standing.drawn,
        lost: standing.lost,
        goalsFor: standing.goalsFor,
        goalsAgainst: standing.goalsAgainst,
        goalDifference: standing.goalDifference,
        points: standing.points,
        team: standing.team
      }))
    })
  } catch (error) {
    console.error('Get league standings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch standings' },
      { status: 500 }
    )
  }
}