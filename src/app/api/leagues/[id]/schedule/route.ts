import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateRoundRobinSchedule, saveScheduleToDatabase } from '@/lib/scheduling'
import { LeagueStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: leagueId } = await params

    // Check if user is the league admin
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        _count: {
          select: { teams: true, matches: true }
        }
      }
    })

    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }

    if (league.adminId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Only league administrators can generate schedules' 
      }, { status: 403 })
    }

    if (league._count.teams < 2) {
      return NextResponse.json({ 
        error: 'At least 2 teams are required to generate a schedule' 
      }, { status: 400 })
    }

    if (league._count.matches > 0) {
      return NextResponse.json({ 
        error: 'Schedule already exists. Delete existing matches first.' 
      }, { status: 400 })
    }

    const {
      startDate,
      matchDurationMinutes = 90,
      breakBetweenMatches = 30,
      matchesPerDay = 4,
      excludeDays = [0], // Sunday
      preferredStartTime = "10:00"
    } = await request.json()

    if (!startDate) {
      return NextResponse.json({ 
        error: 'Start date is required' 
      }, { status: 400 })
    }

    const scheduleStartDate = new Date(startDate)
    if (scheduleStartDate < new Date()) {
      return NextResponse.json({ 
        error: 'Start date cannot be in the past' 
      }, { status: 400 })
    }

    // Generate the schedule
    const fixtures = await generateRoundRobinSchedule({
      leagueId,
      startDate: scheduleStartDate,
      matchDurationMinutes,
      breakBetweenMatches,
      matchesPerDay,
      excludeDays,
      preferredStartTime
    })

    // Save to database
    await saveScheduleToDatabase(leagueId, fixtures)

    // Return the generated fixtures
    const matches = await prisma.match.findMany({
      where: { leagueId },
      include: {
        homeTeam: {
          select: { id: true, name: true, logo: true }
        },
        awayTeam: {
          select: { id: true, name: true, logo: true }
        }
      },
      orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }]
    })

    return NextResponse.json({
      message: 'Schedule generated successfully',
      totalMatches: matches.length,
      totalRounds: Math.max(...matches.map(m => m.round)),
      matches
    })
  } catch (error) {
    console.error('Generate schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to generate schedule' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: leagueId } = await params

    // Check if user is the league admin
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      select: { adminId: true, status: true }
    })

    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }

    if (league.adminId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Only league administrators can delete schedules' 
      }, { status: 403 })
    }

    if (league.status === LeagueStatus.IN_PROGRESS) {
      return NextResponse.json({ 
        error: 'Cannot delete schedule for a league that is in progress' 
      }, { status: 400 })
    }

    // Delete all matches for the league
    const deleteResult = await prisma.match.deleteMany({
      where: { leagueId }
    })

    // Delete all standings
    await prisma.standing.deleteMany({
      where: { leagueId }
    })

    // Update league status back to registration open
    await prisma.league.update({
      where: { id: leagueId },
      data: { status: LeagueStatus.REGISTRATION_OPEN }
    })

    return NextResponse.json({
      message: 'Schedule deleted successfully',
      deletedMatches: deleteResult.count
    })
  } catch (error) {
    console.error('Delete schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leagueId } = await params

    // Get all matches for the league
    const matches = await prisma.match.findMany({
      where: { leagueId },
      include: {
        homeTeam: {
          select: { id: true, name: true, logo: true }
        },
        awayTeam: {
          select: { id: true, name: true, logo: true }
        },
        referee: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }]
    })

    // Group matches by round
    const rounds = matches.reduce((acc, match) => {
      if (!acc[match.round]) {
        acc[match.round] = []
      }
      acc[match.round].push(match)
      return acc
    }, {} as Record<number, typeof matches>)

    return NextResponse.json({
      totalMatches: matches.length,
      totalRounds: Object.keys(rounds).length,
      rounds,
      matches
    })
  } catch (error) {
    console.error('Get schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}