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

    if (session.user.role !== 'REFEREE') {
      return NextResponse.json({ 
        error: 'Only referees can access this endpoint' 
      }, { status: 403 })
    }

    // Get all matches assigned to this referee
    const matches = await prisma.match.findMany({
      where: {
        refereeId: session.user.id
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
        },
        league: {
          select: {
            id: true,
            name: true,
            sport: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    return NextResponse.json({
      matches,
      total: matches.length
    })
  } catch (error) {
    console.error('Get referee matches error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referee matches' },
      { status: 500 }
    )
  }
}