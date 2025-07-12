"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserManagement } from "@/components/user-management"
import { ReceptorManagement } from "@/components/receptor-management"
import { ParameterConfiguration } from "@/components/parameter-configuration"
import { AdminStats } from "@/components/admin-stats"

export default function AdminDashboard() {
    const [defaultParams, setDefaultParams] = useState<any | null>(null)
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalReceptors: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Admin Dashboard" text="Manage users, receptors, and system configuration." />

      <AdminStats stats={stats} />

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="receptors">Receptor Files</TabsTrigger>
          <TabsTrigger value="parameters">Default Parameters</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>

        <TabsContent value="receptors" className="space-y-4">
          <ReceptorManagement />
        </TabsContent>

        <TabsContent value="parameters" className="space-y-4">
          <ParameterConfiguration />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
