"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { pusherClient } from '@/lib/pusher'
import { useSession } from 'next-auth/react'

interface PusherContextValue {
  isConnected: boolean
  connectionState: string
}

const PusherContext = createContext<PusherContextValue>({
  isConnected: false,
  connectionState: 'disconnected',
})

export function usePusherContext() {
  return useContext(PusherContext)
}

interface PusherProviderProps {
  children: React.ReactNode
}

export function PusherProvider({ children }: PusherProviderProps) {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState('disconnected')

  useEffect(() => {
    if (!session?.user) return

    // Connection state listeners
    pusherClient.connection.bind('connected', () => {
      setIsConnected(true)
      setConnectionState('connected')
      console.log('Pusher connected')
    })

    pusherClient.connection.bind('disconnected', () => {
      setIsConnected(false)
      setConnectionState('disconnected')
      console.log('Pusher disconnected')
    })

    pusherClient.connection.bind('connecting', () => {
      setConnectionState('connecting')
      console.log('Pusher connecting')
    })

    pusherClient.connection.bind('unavailable', () => {
      setIsConnected(false)
      setConnectionState('unavailable')
      console.log('Pusher unavailable')
    })

    pusherClient.connection.bind('failed', () => {
      setIsConnected(false)
      setConnectionState('failed')
      console.log('Pusher connection failed')
    })

    // Connect if not already connected
    if (pusherClient.connection.state === 'disconnected') {
      pusherClient.connect()
    }

    return () => {
      pusherClient.disconnect()
    }
  }, [session?.user])

  return (
    <PusherContext.Provider value={{ isConnected, connectionState }}>
      {children}
    </PusherContext.Provider>
  )
}