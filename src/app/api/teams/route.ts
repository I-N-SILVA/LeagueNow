import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LeagueStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      name,
      description,
      contactEmail,
      contactPhone,
      logo,
      leagueId
    } = await request.json()

    // Validate required fields
    if (!name || !leagueId || !contactEmail) {
      return NextResponse.json(
        { error: 'Team name, league, and contact email are required' },
        { status: 400 }
      )
    }

    // Check if league exists and is accepting registrations
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        _count: {
          select: { teams: true }
        }
      }
    })

    if (!league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      )
    }

    if (league.status !== LeagueStatus.REGISTRATION_OPEN && league.status !== LeagueStatus.DRAFT) {
      return NextResponse.json(
        { error: 'League is not accepting new team registrations' },
        { status: 400 }
      )
    }

    if (league._count.teams >= league.maxTeams) {
      return NextResponse.json(
        { error: 'League is full. Maximum teams reached.' },
        { status: 400 }
      )
    }

    // Check if team name is unique within the league
    const existingTeam = await prisma.team.findUnique({
      where: {
        leagueId_name: {
          leagueId,
          name
        }
      }
    })

    if (existingTeam) {
      return NextResponse.json(
        { error: 'A team with this name already exists in the league' },
        { status: 400 }
      )
    }

    // Check if user already has a team in this league
    const userTeamInLeague = await prisma.team.findFirst({
      where: {
        leagueId,
        managerId: session.user.id
      }
    })

    if (userTeamInLeague) {
      return NextResponse.json(
        { error: 'You already have a team registered in this league' },
        { status: 400 }
      )
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        name,
        description: description || null,
        contactEmail,
        contactPhone: contactPhone || null,
        logo: logo || null,
        leagueId,
        managerId: session.user.id,
      },
      include: {
        league: {
          select: {
            id: true,
            name: true,
            sport: true,
            status: true,
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            players: true,
          }
        }
      }
    })

    // Update league status to REGISTRATION_OPEN if it was DRAFT
    if (league.status === LeagueStatus.DRAFT) {
      await prisma.league.update({
        where: { id: leagueId },
        data: { status: LeagueStatus.REGISTRATION_OPEN }
      })
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error('Create team error:', error)
    return NextResponse.json(
      { error: 'Failed to register team' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leagueId = searchParams.get('league')
    const managerId = searchParams.get('manager')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (leagueId) {
      where.leagueId = leagueId
    }
    
    if (managerId) {
      where.managerId = managerId
    }

    // Get teams with pagination
    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          league: {
            select: {
              id: true,
              name: true,
              sport: true,
              status: true,
            }
          },
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          _count: {
            select: {
              players: true,
            }
          }
        }
      }),
      prisma.team.count({ where })
    ])

    return NextResponse.json({
      teams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get teams error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}