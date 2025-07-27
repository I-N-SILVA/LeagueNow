import { PrismaClient, MatchStatus, LeagueStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create users with different roles
  const hashedPassword = await bcrypt.hash('password123', 12)

  // League Admin
  const leagueAdmin = await prisma.user.upsert({
    where: { email: 'admin@leagueflow.com' },
    update: {},
    create: {
      email: 'admin@leagueflow.com',
      name: 'League Administrator',
      password: hashedPassword,
      role: 'LEAGUE_ADMIN',
    },
  })

  // Team Managers
  const teamManager1 = await prisma.user.upsert({
    where: { email: 'manager1@team.com' },
    update: {},
    create: {
      email: 'manager1@team.com',
      name: 'John Smith',
      password: hashedPassword,
      role: 'TEAM_MANAGER',
    },
  })

  const teamManager2 = await prisma.user.upsert({
    where: { email: 'manager2@team.com' },
    update: {},
    create: {
      email: 'manager2@team.com',
      name: 'Sarah Johnson',
      password: hashedPassword,
      role: 'TEAM_MANAGER',
    },
  })

  const teamManager3 = await prisma.user.upsert({
    where: { email: 'manager3@team.com' },
    update: {},
    create: {
      email: 'manager3@team.com',
      name: 'Mike Wilson',
      password: hashedPassword,
      role: 'TEAM_MANAGER',
    },
  })

  const teamManager4 = await prisma.user.upsert({
    where: { email: 'manager4@team.com' },
    update: {},
    create: {
      email: 'manager4@team.com',
      name: 'Lisa Brown',
      password: hashedPassword,
      role: 'TEAM_MANAGER',
    },
  })

  // Referees
  const referee1 = await prisma.user.upsert({
    where: { email: 'referee1@league.com' },
    update: {},
    create: {
      email: 'referee1@league.com',
      name: 'David referee',
      password: hashedPassword,
      role: 'REFEREE',
    },
  })

  const referee2 = await prisma.user.upsert({
    where: { email: 'referee2@league.com' },
    update: {},
    create: {
      email: 'referee2@league.com',
      name: 'Emma Martinez',
      password: hashedPassword,
      role: 'REFEREE',
    },
  })

  console.log('✅ Users created')

  // Create leagues
  const soccerLeague = await prisma.league.upsert({
    where: { id: 'soccer-league-1' },
    update: {},
    create: {
      id: 'soccer-league-1',
      name: 'Premier Soccer League',
      sport: 'SOCCER',
      status: MatchStatus.IN_PROGRESS,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-15'),
      adminId: leagueAdmin.id,
    },
  })

  const basketballLeague = await prisma.league.upsert({
    where: { id: 'basketball-league-1' },
    update: {},
    create: {
      id: 'basketball-league-1',
      name: 'City Basketball Championship',
      sport: 'BASKETBALL',
      status: LeagueStatus.REGISTRATION_OPEN,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-05-30'),
      adminId: leagueAdmin.id,
    },
  })

  console.log('✅ Leagues created')

  // Create teams for soccer league
  const soccerTeam1 = await prisma.team.upsert({
    where: { id: 'team-tigers' },
    update: {},
    create: {
      id: 'team-tigers',
      name: 'City Tigers',
      leagueId: soccerLeague.id,
      managerId: teamManager1.id,
      logo: 'https://res.cloudinary.com/demo/image/upload/v1/tiger_logo.png',
    },
  })

  const soccerTeam2 = await prisma.team.upsert({
    where: { id: 'team-eagles' },
    update: {},
    create: {
      id: 'team-eagles',
      name: 'Metro Eagles',
      leagueId: soccerLeague.id,
      managerId: teamManager2.id,
      logo: 'https://res.cloudinary.com/demo/image/upload/v1/eagle_logo.png',
    },
  })

  const soccerTeam3 = await prisma.team.upsert({
    where: { id: 'team-lions' },
    update: {},
    create: {
      id: 'team-lions',
      name: 'Royal Lions',
      leagueId: soccerLeague.id,
      managerId: teamManager3.id,
      logo: 'https://res.cloudinary.com/demo/image/upload/v1/lion_logo.png',
    },
  })

  const soccerTeam4 = await prisma.team.upsert({
    where: { id: 'team-wolves' },
    update: {},
    create: {
      id: 'team-wolves',
      name: 'Forest Wolves',
      leagueId: soccerLeague.id,
      managerId: teamManager4.id,
      logo: 'https://res.cloudinary.com/demo/image/upload/v1/wolf_logo.png',
    },
  })

  console.log('✅ Teams created')

  // Create players for each team
  const tigerPlayers = [
    { name: 'Alex Rodriguez', position: 'Forward', jerseyNumber: 10 },
    { name: 'Marcus Thompson', position: 'Midfielder', jerseyNumber: 8 },
    { name: 'Kevin Lee', position: 'Defender', jerseyNumber: 4 },
    { name: 'James Wilson', position: 'Goalkeeper', jerseyNumber: 1 },
    { name: 'Carlos Martinez', position: 'Forward', jerseyNumber: 9 },
    { name: 'Ryan Davis', position: 'Midfielder', jerseyNumber: 7 },
    { name: 'Samuel Jones', position: 'Defender', jerseyNumber: 3 },
    { name: 'Daniel Brown', position: 'Midfielder', jerseyNumber: 6 },
    { name: 'Robert Garcia', position: 'Defender', jerseyNumber: 2 },
    { name: 'Michael Johnson', position: 'Forward', jerseyNumber: 11 },
    { name: 'Christopher Taylor', position: 'Defender', jerseyNumber: 5 },
  ]

  for (const player of tigerPlayers) {
    await prisma.player.upsert({
      where: { teamId_jerseyNumber: { teamId: soccerTeam1.id, jerseyNumber: player.jerseyNumber } },
      update: {},
      create: {
        name: player.name,
        teamId: soccerTeam1.id,
        position: player.position,
        jerseyNumber: player.jerseyNumber,
        photo: `https://res.cloudinary.com/demo/image/upload/v1/player_${player.jerseyNumber}.jpg`,
      },
    })
  }

  const eaglePlayers = [
    { name: 'Luis Gonzalez', position: 'Forward', jerseyNumber: 10 },
    { name: 'Anthony White', position: 'Midfielder', jerseyNumber: 8 },
    { name: 'Brian Anderson', position: 'Defender', jerseyNumber: 4 },
    { name: 'Steven Clark', position: 'Goalkeeper', jerseyNumber: 1 },
    { name: 'Victor Lopez', position: 'Forward', jerseyNumber: 9 },
    { name: 'Jonathan Miller', position: 'Midfielder', jerseyNumber: 7 },
    { name: 'Nathan Wright', position: 'Defender', jerseyNumber: 3 },
    { name: 'Patrick Hill', position: 'Midfielder', jerseyNumber: 6 },
    { name: 'Timothy Scott', position: 'Defender', jerseyNumber: 2 },
    { name: 'George Green', position: 'Forward', jerseyNumber: 11 },
    { name: 'Joshua Adams', position: 'Defender', jerseyNumber: 5 },
  ]

  for (const player of eaglePlayers) {
    await prisma.player.upsert({
      where: { teamId_jerseyNumber: { teamId: soccerTeam2.id, jerseyNumber: player.jerseyNumber } },
      update: {},
      create: {
        name: player.name,
        teamId: soccerTeam2.id,
        position: player.position,
        jerseyNumber: player.jerseyNumber,
        photo: `https://res.cloudinary.com/demo/image/upload/v1/player_eagle_${player.jerseyNumber}.jpg`,
      },
    })
  }

  const lionPlayers = [
    { name: 'Thomas King', position: 'Forward', jerseyNumber: 10 },
    { name: 'Andrew Baker', position: 'Midfielder', jerseyNumber: 8 },
    { name: 'Benjamin Hall', position: 'Defender', jerseyNumber: 4 },
    { name: 'Matthew Young', position: 'Goalkeeper', jerseyNumber: 1 },
    { name: 'Alexander Turner', position: 'Forward', jerseyNumber: 9 },
    { name: 'Nicholas Phillips', position: 'Midfielder', jerseyNumber: 7 },
    { name: 'Tyler Campbell', position: 'Defender', jerseyNumber: 3 },
    { name: 'Jacob Parker', position: 'Midfielder', jerseyNumber: 6 },
    { name: 'William Evans', position: 'Defender', jerseyNumber: 2 },
    { name: 'Justin Edwards', position: 'Forward', jerseyNumber: 11 },
    { name: 'Aaron Collins', position: 'Defender', jerseyNumber: 5 },
  ]

  for (const player of lionPlayers) {
    await prisma.player.upsert({
      where: { teamId_jerseyNumber: { teamId: soccerTeam3.id, jerseyNumber: player.jerseyNumber } },
      update: {},
      create: {
        name: player.name,
        teamId: soccerTeam3.id,
        position: player.position,
        jerseyNumber: player.jerseyNumber,
        photo: `https://res.cloudinary.com/demo/image/upload/v1/player_lion_${player.jerseyNumber}.jpg`,
      },
    })
  }

  const wolfPlayers = [
    { name: 'Ryan Stewart', position: 'Forward', jerseyNumber: 10 },
    { name: 'Kevin Morris', position: 'Midfielder', jerseyNumber: 8 },
    { name: 'Sean Rogers', position: 'Defender', jerseyNumber: 4 },
    { name: 'Brandon Cook', position: 'Goalkeeper', jerseyNumber: 1 },
    { name: 'Eric Murphy', position: 'Forward', jerseyNumber: 9 },
    { name: 'Travis Bailey', position: 'Midfielder', jerseyNumber: 7 },
    { name: 'Jeremy Rivera', position: 'Defender', jerseyNumber: 3 },
    { name: 'Adam Cooper', position: 'Midfielder', jerseyNumber: 6 },
    { name: 'Shane Reed', position: 'Defender', jerseyNumber: 2 },
    { name: 'Cody Bell', position: 'Forward', jerseyNumber: 11 },
    { name: 'Marcus Ward', position: 'Defender', jerseyNumber: 5 },
  ]

  for (const player of wolfPlayers) {
    await prisma.player.upsert({
      where: { teamId_jerseyNumber: { teamId: soccerTeam4.id, jerseyNumber: player.jerseyNumber } },
      update: {},
      create: {
        name: player.name,
        teamId: soccerTeam4.id,
        position: player.position,
        jerseyNumber: player.jerseyNumber,
        photo: `https://res.cloudinary.com/demo/image/upload/v1/player_wolf_${player.jerseyNumber}.jpg`,
      },
    })
  }

  console.log('✅ Players created')

  // Create sample matches
  const matches = [
    {
      id: 'match-1',
      round: 1,
      matchNumber: 1,
      homeTeamId: soccerTeam1.id,
      awayTeamId: soccerTeam2.id,
      scheduledAt: new Date('2024-01-20T15:00:00Z'),
      status: MatchStatus.COMPLETED,
      homeScore: 2,
      awayScore: 1,
      refereeId: referee1.id,
    },
    {
      id: 'match-2',
      round: 1,
      matchNumber: 2,
      homeTeamId: soccerTeam3.id,
      awayTeamId: soccerTeam4.id,
      scheduledAt: new Date('2024-01-20T17:00:00Z'),
      status: MatchStatus.COMPLETED,
      homeScore: 1,
      awayScore: 3,
      refereeId: referee2.id,
    },
    {
      id: 'match-3',
      round: 2,
      matchNumber: 3,
      homeTeamId: soccerTeam1.id,
      awayTeamId: soccerTeam3.id,
      scheduledAt: new Date('2024-01-27T15:00:00Z'),
      status: MatchStatus.IN_PROGRESS,
      homeScore: 1,
      awayScore: 0,
      refereeId: referee1.id,
    },
    {
      id: 'match-4',
      round: 2,
      matchNumber: 4,
      homeTeamId: soccerTeam2.id,
      awayTeamId: soccerTeam4.id,
      scheduledAt: new Date('2024-01-27T17:00:00Z'),
      status: MatchStatus.SCHEDULED,
      homeScore: 0,
      awayScore: 0,
      refereeId: referee2.id,
    },
    {
      id: 'match-5',
      round: 3,
      matchNumber: 5,
      homeTeamId: soccerTeam1.id,
      awayTeamId: soccerTeam4.id,
      scheduledAt: new Date('2024-02-03T15:00:00Z'),
      status: MatchStatus.SCHEDULED,
      homeScore: 0,
      awayScore: 0,
      refereeId: referee1.id,
    },
    {
      id: 'match-6',
      round: 3,
      matchNumber: 6,
      homeTeamId: soccerTeam2.id,
      awayTeamId: soccerTeam3.id,
      scheduledAt: new Date('2024-02-03T17:00:00Z'),
      status: MatchStatus.SCHEDULED,
      homeScore: 0,
      awayScore: 0,
      refereeId: referee2.id,
    },
  ]

  for (const match of matches) {
    await prisma.match.upsert({
      where: { id: match.id },
      update: {},
      create: {
        ...match,
        leagueId: soccerLeague.id,
      },
    })
  }

  console.log('✅ Matches created')

  // Create standings for completed matches
  const standings = [
    {
      teamId: soccerTeam1.id,
      leagueId: soccerLeague.id,
      position: 1,
      played: 2,
      won: 2,
      drawn: 0,
      lost: 0,
      goalsFor: 3,
      goalsAgainst: 1,
      goalDifference: 2,
      points: 6,
    },
    {
      teamId: soccerTeam4.id,
      leagueId: soccerLeague.id,
      position: 2,
      played: 1,
      won: 1,
      drawn: 0,
      lost: 0,
      goalsFor: 3,
      goalsAgainst: 1,
      goalDifference: 2,
      points: 3,
    },
    {
      teamId: soccerTeam2.id,
      leagueId: soccerLeague.id,
      position: 3,
      played: 1,
      won: 0,
      drawn: 0,
      lost: 1,
      goalsFor: 1,
      goalsAgainst: 2,
      goalDifference: -1,
      points: 0,
    },
    {
      teamId: soccerTeam3.id,
      leagueId: soccerLeague.id,
      position: 4,
      played: 1,
      won: 0,
      drawn: 0,
      lost: 1,
      goalsFor: 1,
      goalsAgainst: 3,
      goalDifference: -2,
      points: 0,
    },
  ]

  for (const standing of standings) {
    await prisma.standing.upsert({
      where: { leagueId_teamId: { leagueId: standing.leagueId, teamId: standing.teamId } },
      update: {},
      create: standing,
    })
  }

  console.log('✅ Standings created')

  // Create sample fan videos
  const fanVideos = [
    {
      id: 'video-1',
      matchId: 'match-1',
      videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/fan_goal_1.mp4',
      thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/goal_thumb_1.jpg',
      title: 'Amazing goal by Alex Rodriguez!',
      description: 'What a strike from outside the box!',
      uploaderName: 'Soccer Fan #1',
      uploaderEmail: 'fan1@example.com',
      approved: true,
    },
    {
      id: 'video-2',
      matchId: 'match-1',
      videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/fan_save_1.mp4',
      thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/save_thumb_1.jpg',
      title: 'Incredible save by James Wilson',
      description: 'The goalkeeper made an amazing diving save!',
      uploaderName: 'Tigers Supporter',
      uploaderEmail: 'tigerfan@example.com',
      approved: true,
    },
    {
      id: 'video-3',
      matchId: 'match-2',
      videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/fan_celebration.mp4',
      thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/celebration_thumb.jpg',
      title: 'Fans celebrate victory',
      description: 'The crowd goes wild after the winning goal!',
      uploaderName: 'Wolves Fan',
      uploaderEmail: 'wolvesfan@example.com',
      approved: true,
    },
  ]

  for (const video of fanVideos) {
    await prisma.fanVideo.upsert({
      where: { id: video.id },
      update: {},
      create: video,
    })
  }

  console.log('✅ Fan videos created')

  console.log('🎉 Database seed completed successfully!')
  console.log('\n📋 Seed Summary:')
  console.log('👥 Users: 6 (1 admin, 4 managers, 2 referees)')
  console.log('🏆 Leagues: 2 (Soccer, Basketball)')
  console.log('⚽ Teams: 4 soccer teams')
  console.log('🏃 Players: 44 players total (11 per team)')
  console.log('⚽ Matches: 6 matches (2 completed, 1 in progress, 3 scheduled)')
  console.log('📊 Standings: Complete standings table')
  console.log('🎥 Fan Videos: 3 sample videos')
  console.log('\n🔐 Test Accounts:')
  console.log('Admin: admin@leagueflow.com / password123')
  console.log('Manager: manager1@team.com / password123')
  console.log('Referee: referee1@league.com / password123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })