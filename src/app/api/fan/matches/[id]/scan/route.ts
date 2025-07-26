import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params

    // Verify match exists
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: { id: true, qrCodeScans: true }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Increment QR code scan count
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        qrCodeScans: {
          increment: 1
        }
      },
      select: {
        qrCodeScans: true
      }
    })

    return NextResponse.json({
      message: 'QR scan recorded',
      qrCodeScans: updatedMatch.qrCodeScans
    })
  } catch (error) {
    console.error('Record QR scan error:', error)
    return NextResponse.json(
      { error: 'Failed to record QR scan' },
      { status: 500 }
    )
  }
}