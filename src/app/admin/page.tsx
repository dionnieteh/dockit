"use client"

import { useCallback, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { UserManagement } from "@/components/user-management"
import { ReceptorManagement } from "@/components/receptor-management"
import { ParameterConfiguration } from "@/components/parameter-configuration"
import { AdminStats } from "@/components/admin-stats"

export default function AdminDashboard() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUserCountChange = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  const handleReceptorCountChange = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  const handleJobCountChange = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  return (
    <DashboardShell>
      <DashboardHeader heading="Admin Dashboard" text="Manage users, receptors, and system configuration." />

      <AdminStats key={refreshKey} />
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="receptors">Receptor Files</TabsTrigger>
          <TabsTrigger value="parameters">Default Parameters</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserManagement onUserCountChange={handleUserCountChange} />
        </TabsContent>

        <TabsContent value="receptors" className="space-y-4">
          <ReceptorManagement onFileCountChange={handleReceptorCountChange}/>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-4">
          <ParameterConfiguration />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
