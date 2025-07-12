"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  logout: () => Promise<void> // ✅ Add logout method
  setUser: (user: User | null) => void // ✅ add this

}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  logout: async () => { }, // default noop
  setUser: () => { }, // noop default

})

export const useUser = () => useContext(UserContext)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/me", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error("Failed to fetch user", err)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    } catch (err) {
      console.error("Logout failed", err)
    } finally {
      setUser(null) // Clear user immediately
    }
  }

  return (
    <UserContext.Provider value={{ user, isLoading, logout, setUser }}>
      {children}
    </UserContext.Provider>
  )
}
