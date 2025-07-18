"use client"

import { useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { JobHistory } from "@/components/job-history"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function JobHistoryPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [user, setUser] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      setAuthError(null);
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        })

        if (!res.ok) throw new Error("Not authenticated")

        const userData = await res.json()

        setUser(userData)
        setUserId(userData.id)
      } catch (err) {
        setAuthError("Unauthorized access. Redirecting...")
        setTimeout(() => {
          router.replace("/login?redirect=/history")
        }, 2000)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const handleJobCountChange = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (authError || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Unauthorized</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{authError}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <DashboardShell>
      <JobHistory onJobCountChange={handleJobCountChange} userId={userId} />
    </DashboardShell>
  )
}
