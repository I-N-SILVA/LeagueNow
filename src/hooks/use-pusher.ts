"use client"

import { useEffect, useRef } from 'react'
import { pusherClient, PusherEvent } from '@/lib/pusher'
import { Channel } from 'pusher-js'

export function usePusher(
  channelName: string,
  eventName: PusherEvent,
  callback: (data: unknown) => void
) {
  const callbackRef = useRef(callback)
  const channelRef = useRef<Channel | null>(null)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    // Subscribe to channel
    const channel = pusherClient.subscribe(channelName)
    channelRef.current = channel

    // Bind event listener
    const eventHandler = (data: unknown) => {
      callbackRef.current(data)
    }

    channel.bind(eventName, eventHandler)

    // Cleanup
    return () => {
      channel.unbind(eventName, eventHandler)
      pusherClient.unsubscribe(channelName)
      channelRef.current = null
    }
  }, [channelName, eventName])

  return channelRef.current
}

export function useMatchUpdates(matchId: string, onUpdate: (data: unknown) => void) {
  return usePusher(`match-${matchId}`, 'match-updated', onUpdate)
}

export function useLeagueUpdates(leagueId: string, onUpdate: (data: unknown) => void) {
  return usePusher(`league-${leagueId}`, 'league-updated', onUpdate)
}

export function useStandingsUpdates(leagueId: string, onUpdate: (data: unknown) => void) {
  return usePusher(`league-${leagueId}`, 'standings-updated', onUpdate)
}

export function useNotifications(userId: string, onNotification: (data: unknown) => void) {
  return usePusher(`user-${userId}`, 'notification', onNotification)
}