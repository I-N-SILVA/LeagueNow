import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

export const pusherServer = new PusherServer({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
})

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true,
  }
)

export const PUSHER_EVENTS = {
  // Match events
  MATCH_STARTED: 'match-started',
  MATCH_UPDATED: 'match-updated', 
  MATCH_COMPLETED: 'match-completed',
  SCORE_UPDATE: 'score-update',
  
  // League events
  LEAGUE_UPDATED: 'league-updated',
  STANDINGS_UPDATED: 'standings-updated',
  
  // Team events
  TEAM_REGISTERED: 'team-registered',
  TEAM_UPDATED: 'team-updated',
  
  // Fan engagement
  FAN_VIDEO_UPLOADED: 'fan-video-uploaded',
  QR_CODE_SCANNED: 'qr-code-scanned',
  
  // Notifications
  NOTIFICATION: 'notification',
} as const

export type PusherEvent = typeof PUSHER_EVENTS[keyof typeof PUSHER_EVENTS]

export interface MatchUpdatePayload {
  matchId: string
  homeScore: number
  awayScore: number
  status: string
  updatedAt: string
}

export interface StandingsUpdatePayload {
  leagueId: string
  standings: Array<{
    teamId: string
    teamName: string
    position: number
    played: number
    won: number
    drawn: number
    lost: number
    points: number
    goalDifference: number
  }>
}

export interface NotificationPayload {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  userId?: string
  leagueId?: string
  teamId?: string
}

export function getChannelName(type: 'league' | 'match' | 'team' | 'user', id: string): string {
  return `${type}-${id}`
}

export function subscribeToLeague(leagueId: string) {
  return pusherClient.subscribe(getChannelName('league', leagueId))
}

export function subscribeToMatch(matchId: string) {
  return pusherClient.subscribe(getChannelName('match', matchId))
}

export function subscribeToTeam(teamId: string) {
  return pusherClient.subscribe(getChannelName('team', teamId))
}

export function subscribeToUser(userId: string) {
  return pusherClient.subscribe(getChannelName('user', userId))
}

export async function triggerMatchUpdate(matchId: string, data: MatchUpdatePayload) {
  await pusherServer.trigger(getChannelName('match', matchId), PUSHER_EVENTS.MATCH_UPDATED, data)
}

export async function triggerStandingsUpdate(leagueId: string, data: StandingsUpdatePayload) {
  await pusherServer.trigger(getChannelName('league', leagueId), PUSHER_EVENTS.STANDINGS_UPDATED, data)
}

export async function triggerNotification(
  channel: string,
  notification: NotificationPayload
) {
  await pusherServer.trigger(channel, PUSHER_EVENTS.NOTIFICATION, notification)
}