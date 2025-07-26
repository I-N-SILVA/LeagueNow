import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leagueId } = await params

    // Get recent completed matches
    const matches = await prisma.match.findMany({
      where: {
        leagueId,
        status: 'COMPLETED'
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 10
    })

    return NextResponse.json({
      matches: matches.map(match => ({
        id: match.id,
        round: match.round,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        scheduledAt: match.scheduledAt.toISOString(),
        status: match.status
      }))
    })
  } catch (error) {
    console.error('Get recent matches error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent matches' },
      { status: 500 }
    )
  }
}