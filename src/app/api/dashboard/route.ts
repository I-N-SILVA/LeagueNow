import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = session.user.role

    let totalLeagues = 0
    let totalTeams = 0
    let totalMatches = 0
    let upcomingMatches = 0

    if (userRole === 'LEAGUE_ADMIN') {
      // Admin sees leagues they created
      totalLeagues = await prisma.league.count({
        where: { adminId: userId }
      })
      
      // Teams in their leagues
      totalTeams = await prisma.team.count({
        where: {
          league: {
            adminId: userId
          }
        }
      })
      
      // Matches in their leagues
      totalMatches = await prisma.match.count({
        where: {
          league: {
            adminId: userId
          }
        }
      })
      
      // Upcoming matches in their leagues
      upcomingMatches = await prisma.match.count({
        where: {
          league: {
            adminId: userId
          },
          scheduledAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          },
          status: 'SCHEDULED'
        }
      })
    } else if (userRole === 'TEAM_MANAGER') {
      // Team manager sees leagues their teams are in
      const userTeams = await prisma.team.findMany({
        where: { managerId: userId },
        include: { league: true }
      })
      
      const leagueIds = [...new Set(userTeams.map(team => team.leagueId))]
      totalLeagues = leagueIds.length
      totalTeams = userTeams.length
      
      // Matches involving their teams
      totalMatches = await prisma.match.count({
        where: {
          OR: [
            { homeTeamId: { in: userTeams.map(t => t.id) } },
            { awayTeamId: { in: userTeams.map(t => t.id) } }
          ]
        }
      })
      
      // Upcoming matches for their teams
      upcomingMatches = await prisma.match.count({
        where: {
          OR: [
            { homeTeamId: { in: userTeams.map(t => t.id) } },
            { awayTeamId: { in: userTeams.map(t => t.id) } }
          ],
          scheduledAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          },
          status: 'SCHEDULED'
        }
      })
    } else if (userRole === 'REFEREE') {
      // Referee sees matches they're assigned to
      const refMatches = await prisma.match.findMany({
        where: { refereeId: userId },
        include: { league: true }
      })
      
      const leagueIds = [...new Set(refMatches.map(match => match.leagueId))]
      totalLeagues = leagueIds.length
      totalMatches = refMatches.length
      
      // Teams in leagues they referee
      totalTeams = await prisma.team.count({
        where: {
          leagueId: { in: leagueIds }
        }
      })
      
      // Upcoming matches they're refereeing
      upcomingMatches = await prisma.match.count({
        where: {
          refereeId: userId,
          scheduledAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          },
          status: 'SCHEDULED'
        }
      })
    }

    return NextResponse.json({
      totalLeagues,
      totalTeams,
      totalMatches,
      upcomingMatches
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}