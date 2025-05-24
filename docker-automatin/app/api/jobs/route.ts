import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// Get all jobs for the current user
export async function GET() {
  try {
    const user = await getUserFromRequest()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await query(
      `SELECT j.*, 
        (SELECT COUNT(*) FROM files WHERE job_id = j.id) as file_count
       FROM docking_jobs j
       WHERE j.user_id = $1
       ORDER BY j.created_at DESC`,
      [user.id],
    )

    return NextResponse.json({
      jobs: result.rows.map((job) => ({
        id: job.id,
        name: job.name,
        status: job.status,
        gridSizeX: job.grid_size_x,
        gridSizeY: job.grid_size_y,
        gridSizeZ: job.grid_size_z,
        fileCount: job.file_count,
        createdAt: job.created_at,
        completedAt: job.completed_at,
      })),
    })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create a new job
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, gridSizeX, gridSizeY, gridSizeZ } = body

    // Validate input
    if (!name) {
      return NextResponse.json({ error: "Job name is required" }, { status: 400 })
    }

    // Create new job
    const result = await query(
      `INSERT INTO docking_jobs (user_id, name, status, grid_size_x, grid_size_y, grid_size_z)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, status, grid_size_x, grid_size_y, grid_size_z, created_at`,
      [user.id, name, "pending", gridSizeX || 30, gridSizeY || 30, gridSizeZ || 30],
    )

    const newJob = result.rows[0]

    return NextResponse.json(
      {
        message: "Job created successfully",
        job: {
          id: newJob.id,
          name: newJob.name,
          status: newJob.status,
          gridSizeX: newJob.grid_size_x,
          gridSizeY: newJob.grid_size_y,
          gridSizeZ: newJob.grid_size_z,
          createdAt: newJob.created_at,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
