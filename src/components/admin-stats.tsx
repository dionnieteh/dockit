import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Activity, Database } from "lucide-react"

interface AdminStatsProps {
  stats: {
    totalUsers: number
    totalJobs: number
    totalReceptors: number
  }
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalJobs}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receptor Files</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalReceptors}</div>
        </CardContent>
      </Card>
    </div>
  )
}
