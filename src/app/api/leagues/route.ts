import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SportType, LeagueStatus } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'LEAGUE_ADMIN') {
      return NextResponse.json({ error: 'Only league administrators can create leagues' }, { status: 403 })
    }

    const {
      name,
      description,
      sport,
      startDate,
      endDate,
      maxTeams,
      pointsForWin,
      pointsForDraw,
      pointsForLoss
    } = await request.json()

    // Validate required fields
    if (!name || !sport || !startDate) {
      return NextResponse.json(
        { error: 'Name, sport, and start date are required' },
        { status: 400 }
      )
    }

    // Validate sport type
    if (!Object.values(SportType).includes(sport)) {
      return NextResponse.json(
        { error: 'Invalid sport type' },
        { status: 400 }
      )
    }

    // Validate dates
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : null
    
    if (start < new Date()) {
      return NextResponse.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      )
    }

    if (end && end <= start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Generate QR code for fan video engagement
    const qrCode = uuidv4()

    // Create league
    const league = await prisma.league.create({
      data: {
        name,
        description: description || null,
        sport,
        startDate: start,
        endDate: end,
        maxTeams: maxTeams || 16,
        pointsForWin: pointsForWin || 3,
        pointsForDraw: pointsForDraw || 1,
        pointsForLoss: pointsForLoss || 0,
        qrCode,
        status: LeagueStatus.DRAFT,
        adminId: session.user.id,
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            teams: true,
            matches: true,
          }
        }
      }
    })

    return NextResponse.json(league)
  } catch (error) {
    console.error('Create league error:', error)
    return NextResponse.json(
      { error: 'Failed to create league' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sport = searchParams.get('sport')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (sport && Object.values(SportType).includes(sport as SportType)) {
      where.sport = sport
    }
    
    if (status && Object.values(LeagueStatus).includes(status as LeagueStatus)) {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get leagues with pagination
    const [leagues, total] = await Promise.all([
      prisma.league.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          _count: {
            select: {
              teams: true,
              matches: true,
            }
          }
        }
      }),
      prisma.league.count({ where })
    ])

    return NextResponse.json({
      leagues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get leagues error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leagues' },
      { status: 500 }
    )
  }
}