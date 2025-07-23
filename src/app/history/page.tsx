"use client"

import { useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { JobHistory } from "@/components/job-history"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { checkAuthUser } from "@/lib/users"

export default function JobHistoryPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [user, setUser] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    const currentPath = window.location.pathname;
    const redirectToLogin = () => {
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
    };

    (async () => {
      setIsCheckingAuth(true);
      setAuthError(null);

      try {
        const userData = await checkAuthUser();
        setUser(userData);
      } catch (error) {
        setAuthError("Failed to verify authentication");
        setTimeout(redirectToLogin, 2000);
      } finally {
        setIsCheckingAuth(false);
      }
    })();
  }, []);

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
