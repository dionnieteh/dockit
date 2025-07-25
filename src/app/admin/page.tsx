"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { UserManagement } from "@/components/user-management"
import { ReceptorManagement } from "@/components/receptor-management"
import { ParameterConfiguration } from "@/components/parameter-configuration"
import { JobConfiguration } from "@/components/job-configuration"
import { AdminStats } from "@/components/admin-stats"
import { Loader2 } from "lucide-react"
import { UserRole } from "@/lib/user-role"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { checkAuthUser } from "@/lib/users"

export default function AdminDashboard() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await checkAuthUser()

        if (!userData || !userData.role) {
          throw new Error("No role")
        }

        if (userData.role !== UserRole.ADMIN) {
          router.replace("/docking")
        } else {
          setUser(userData)
        }
      } catch (err) {
        setAuthError("Unauthorized access. Redirecting...")
        setTimeout(() => {
          router.replace("/login?redirect=/admin")
        }, 1500)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleUserCountChange = useCallback(() => setRefreshKey(prev => prev + 1), [])
  const handleReceptorCountChange = useCallback(() => setRefreshKey(prev => prev + 1), [])
  const handleJobCountChange = useCallback(() => setRefreshKey(prev => prev + 1), [])

  if (loading) {
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
      <DashboardHeader heading="Admin Dashboard" text="Manage users, receptors, and system configuration." />
      <AdminStats key={refreshKey}/>
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users and Admins</TabsTrigger>
          <TabsTrigger value="jobs">Docking Jobs</TabsTrigger>
          <TabsTrigger value="receptors">Receptor Files</TabsTrigger>
          <TabsTrigger value="parameters">Default Parameters</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserManagement onUserCountChange={handleUserCountChange} />
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <JobConfiguration onJobCountChange={handleJobCountChange} />
        </TabsContent>

        <TabsContent value="receptors" className="space-y-4">
          <ReceptorManagement onFileCountChange={handleReceptorCountChange} />
        </TabsContent>

        <TabsContent value="parameters" className="space-y-4">
          <ParameterConfiguration />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
