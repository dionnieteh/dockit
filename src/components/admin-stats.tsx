import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Database } from "lucide-react"
import { getUserCount } from "@/lib/users"

import React, { useEffect, useState, useCallback } from "react"
import { getReceptorCount } from "@/lib/receptors"
import { useToast } from "@/hooks/use-toast"
import { TOAST } from "@/lib/toast-messages"
import { getJobCount } from "@/lib/jobs"

export function AdminStats() {
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalJobs, setTotalJobs] = useState(0)
  const [totalReceptors, setTotalReceptors] = useState(0)
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)

      const userCount = await getUserCount()

      if (typeof userCount === 'number') {
        setTotalUsers(userCount)
      } else {
        setTotalUsers(0)
        throw new Error(userCount.error)
      }

      const receptorCount = await getReceptorCount()

      if (typeof receptorCount === 'number') {
        setTotalReceptors(receptorCount)
      } else {
        setTotalReceptors(0)
        throw new Error(receptorCount.error)
      }

      const jobCount = await getJobCount()
      

    } catch (error) {
      console.error("Failed to fetch stats:", error)
      toast({
        title: TOAST.STATS_ERROR.title,
        description: TOAST.STATS_ERROR.description + (error ? error : "Unknown error"),
        variant: TOAST.STATS_ERROR.variant,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
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