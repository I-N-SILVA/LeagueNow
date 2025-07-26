import { prisma } from './prisma'
import { MatchStatus } from '@prisma/client'

export interface ScheduleOptions {
  leagueId: string
  startDate: Date
  matchDurationMinutes?: number
  breakBetweenMatches?: number
  matchesPerDay?: number
  excludeDays?: number[] // 0 = Sunday, 1 = Monday, etc.
  preferredStartTime?: string // "HH:MM" format
}

export interface MatchFixture {
  round: number
  matchNumber: number
  homeTeamId: string
  awayTeamId: string
  scheduledAt: Date
}

/**
 * Generate round-robin schedule for all teams in a league
 */
export async function generateRoundRobinSchedule(options: ScheduleOptions): Promise<MatchFixture[]> {
  const {
    leagueId,
    startDate,
    matchDurationMinutes = 90,
    breakBetweenMatches = 30,
    matchesPerDay = 4,
    excludeDays = [0], // Exclude Sundays by default
    preferredStartTime = "10:00"
  } = options

  // Get all teams in the league
  const teams = await prisma.team.findMany({
    where: { leagueId },
    select: { id: true, name: true }
  })

  if (teams.length < 2) {
    throw new Error('At least 2 teams are required to generate a schedule')
  }

  // Generate round-robin pairings
  const fixtures: MatchFixture[] = []
  const teamIds = teams.map(t => t.id)
  
  // Round-robin algorithm
  const totalRounds = teamIds.length % 2 === 0 
    ? teamIds.length - 1 
    : teamIds.length

  for (let round = 1; round <= totalRounds; round++) {
    const roundMatches = generateRoundMatches(teamIds, round)
    
    roundMatches.forEach((match, index) => {
      fixtures.push({
        round,
        matchNumber: index + 1,
        homeTeamId: match.home,
        awayTeamId: match.away,
        scheduledAt: new Date() // Will be set properly below
      })
    })
  }

  // Schedule match times
  let currentDate = new Date(startDate)
  let matchesScheduledToday = 0
  let currentTime = parseTime(preferredStartTime)

  for (const fixture of fixtures) {
    // Skip excluded days
    while (excludeDays.includes(currentDate.getDay())) {
      currentDate = addDays(currentDate, 1)
      matchesScheduledToday = 0
      currentTime = parseTime(preferredStartTime)
    }

    // If we've reached the daily match limit, move to next day
    if (matchesScheduledToday >= matchesPerDay) {
      currentDate = addDays(currentDate, 1)
      matchesScheduledToday = 0
      currentTime = parseTime(preferredStartTime)
      
      // Skip excluded days again
      while (excludeDays.includes(currentDate.getDay())) {
        currentDate = addDays(currentDate, 1)
      }
    }

    // Set the match time
    const matchDateTime = new Date(currentDate)
    matchDateTime.setHours(currentTime.hours, currentTime.minutes, 0, 0)
    fixture.scheduledAt = matchDateTime

    // Move to next time slot
    currentTime = addMinutes(currentTime, matchDurationMinutes + breakBetweenMatches)
    matchesScheduledToday++

    // If time goes past reasonable hours (e.g., 10 PM), move to next day
    if (currentTime.hours >= 22) {
      currentDate = addDays(currentDate, 1)
      matchesScheduledToday = 0
      currentTime = parseTime(preferredStartTime)
    }
  }

  return fixtures
}

/**
 * Generate matches for a specific round using round-robin algorithm
 */
function generateRoundMatches(teamIds: string[], round: number): Array<{home: string, away: string}> {
  const matches: Array<{home: string, away: string}> = []
  const teams = [...teamIds]
  const numTeams = teams.length

  // If odd number of teams, add a "bye" team
  if (numTeams % 2 === 1) {
    teams.push('BYE')
  }

  const totalTeams = teams.length
  const halfTeams = totalTeams / 2

  // Rotate teams for round-robin (keep first team fixed)
  const rotatedTeams = [...teams]
  for (let r = 1; r < round; r++) {
    const temp = rotatedTeams[1]
    for (let i = 1; i < totalTeams - 1; i++) {
      rotatedTeams[i] = rotatedTeams[i + 1]
    }
    rotatedTeams[totalTeams - 1] = temp
  }

  // Create matches for this round
  for (let i = 0; i < halfTeams; i++) {
    const home = rotatedTeams[i]
    const away = rotatedTeams[totalTeams - 1 - i]

    // Skip matches involving "BYE"
    if (home !== 'BYE' && away !== 'BYE') {
      matches.push({ home, away })
    }
  }

  return matches
}

/**
 * Save generated schedule to database
 */
export async function saveScheduleToDatabase(leagueId: string, fixtures: MatchFixture[]): Promise<void> {
  // Delete existing matches for the league
  await prisma.match.deleteMany({
    where: { leagueId }
  })

  // Create new matches
  await prisma.match.createMany({
    data: fixtures.map(fixture => ({
      leagueId,
      round: fixture.round,
      matchNumber: fixture.matchNumber,
      homeTeamId: fixture.homeTeamId,
      awayTeamId: fixture.awayTeamId,
      scheduledAt: fixture.scheduledAt,
      status: MatchStatus.SCHEDULED
    }))
  })

  // Update league status
  await prisma.league.update({
    where: { id: leagueId },
    data: { status: 'REGISTRATION_CLOSED' }
  })
}

/**
 * Calculate and update league standings
 */
export async function updateLeagueStandings(leagueId: string): Promise<void> {
  // Get all teams in the league
  const teams = await prisma.team.findMany({
    where: { leagueId },
    include: {
      homeMatches: {
        where: { status: MatchStatus.COMPLETED }
      },
      awayMatches: {
        where: { status: MatchStatus.COMPLETED }
      }
    }
  })

  // Get league scoring settings
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    select: { pointsForWin: true, pointsForDraw: true, pointsForLoss: true }
  })

  if (!league) return

  // Calculate standings for each team
  const standings = teams.map(team => {
    let played = 0
    let won = 0
    let drawn = 0
    let lost = 0
    let goalsFor = 0
    let goalsAgainst = 0
    let points = 0

    // Process home matches
    team.homeMatches.forEach(match => {
      played++
      goalsFor += match.homeScore
      goalsAgainst += match.awayScore

      if (match.homeScore > match.awayScore) {
        won++
        points += league.pointsForWin
      } else if (match.homeScore === match.awayScore) {
        drawn++
        points += league.pointsForDraw
      } else {
        lost++
        points += league.pointsForLoss
      }
    })

    // Process away matches
    team.awayMatches.forEach(match => {
      played++
      goalsFor += match.awayScore
      goalsAgainst += match.homeScore

      if (match.awayScore > match.homeScore) {
        won++
        points += league.pointsForWin
      } else if (match.awayScore === match.homeScore) {
        drawn++
        points += league.pointsForDraw
      } else {
        lost++
        points += league.pointsForLoss
      }
    })

    const goalDifference = goalsFor - goalsAgainst

    return {
      teamId: team.id,
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDifference,
      points
    }
  })

  // Sort by points (desc), then goal difference (desc), then goals for (desc)
  standings.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points
    if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference
    return b.goalsFor - a.goalsFor
  })

  // Delete existing standings
  await prisma.standing.deleteMany({
    where: { leagueId }
  })

  // Create new standings
  await prisma.standing.createMany({
    data: standings.map((standing, index) => ({
      leagueId,
      teamId: standing.teamId,
      position: index + 1,
      played: standing.played,
      won: standing.won,
      drawn: standing.drawn,
      lost: standing.lost,
      goalsFor: standing.goalsFor,
      goalsAgainst: standing.goalsAgainst,
      goalDifference: standing.goalDifference,
      points: standing.points
    }))
  })
}

// Helper functions
function parseTime(timeString: string): { hours: number, minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number)
  return { hours, minutes }
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addMinutes(time: { hours: number, minutes: number }, minutes: number): { hours: number, minutes: number } {
  const totalMinutes = time.hours * 60 + time.minutes + minutes
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return { hours, minutes: mins }
}