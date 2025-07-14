import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Database } from "lucide-react"
import { getUserCount } from "@/lib/users"
import React, { useEffect, useState, useCallback } from "react"

export function AdminStats() {
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalJobs, setTotalJobs] = useState(0)
  const [totalReceptors, setTotalReceptors] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch user count
      const userCount = await getUserCount()
      setTotalUsers(userCount)

      // TODO: Add these functions to your lib files
      // const jobCount = await getJobCount()
      // const receptorCount = await getReceptorCount()
      // setTotalJobs(jobCount)
      // setTotalReceptors(receptorCount)

      // For now, set dummy values or fetch from your APIs
      setTotalJobs(0) // Replace with actual API call
      setTotalReceptors(0) // Replace with actual API call

    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Method to refresh stats that can be called from parent
  const refreshStats = useCallback(() => {
    fetchStats()
  }, [fetchStats])

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Users
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : totalUsers}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Jobs
          </CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : totalJobs}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Receptor Files
          </CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : totalReceptors}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}