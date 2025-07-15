// hooks/refresh-user-stats.tsx
import { useState, useEffect, useCallback } from 'react'
import { getUserCount } from '@/lib/users'

// Simple event emitter for user stats updates
class UserStatsEmitter {
  private listeners: (() => void)[] = []

  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  emit() {
    this.listeners.forEach(listener => listener())
  }
}

const userStatsEmitter = new UserStatsEmitter()

export function refreshUserStats() {
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchUserCount = useCallback(async () => {
    try {
      setLoading(true)
      const userCount = await getUserCount()
      if (typeof userCount === 'object' && 'error' in userCount) {
        throw new Error(userCount.error)
      } else if (typeof userCount === 'number')
        setTotalUsers(userCount)
    } catch (error) {
      console.error("Failed to fetch user count:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshUser = useCallback(() => {
    userStatsEmitter.emit()
  }, [])

  useEffect(() => {
    fetchUserCount()

    const unsubscribe = userStatsEmitter.subscribe(fetchUserCount)
    return unsubscribe
  }, [fetchUserCount])

  return {
    totalUsers,
    loading,
    refreshUser
  }
}