"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { FileUpload } from "@/components/file-upload"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function NewJobPage() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [gridSizeX, setGridSizeX] = useState(30)
  const [gridSizeY, setGridSizeY] = useState(30)
  const [gridSizeZ, setGridSizeZ] = useState(30)
  const [jobName, setJobName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [jobId, setJobId] = useState<string | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      alert("Please upload at least one file")
      return
    }

    setIsSubmitting(true)

    try {
      // Create a new job
      const jobResponse = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: jobName,
          gridSizeX,
          gridSizeY,
          gridSizeZ,
        }),
      })

      if (!jobResponse.ok) {
        throw new Error("Failed to create job")
      }

      const jobData = await jobResponse.json()
      const newJobId = jobData.job.id

      setJobId(newJobId)

      // Upload files
      const formData = new FormData()
      formData.append("jobId", newJobId)

      files.forEach((file) => {
        formData.append("files", file)
      })

      const uploadResponse = await fetch("/api/rpa/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload files")
      }

      // Start job processing
      const startResponse = await fetch("/api/rpa/start-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: newJobId,
          gridSizeX,
          gridSizeY,
          gridSizeZ,
        }),
      })

      if (!startResponse.ok) {
        throw new Error("Failed to start job processing")
      }

      // Show progress tracking
      setShowProgress(true)

      // Start polling for progress updates
      progressIntervalRef.current = setInterval(() => {
        fetchJobProgress(newJobId)
      }, 2000)
    } catch (error) {
      console.error("Error submitting job:", error)
      alert("An error occurred while submitting the job. Please try again.")
      setIsSubmitting(false)
    }
  }

  const fetchJobProgress = async (id: string) => {
    try {
      const response = await fetch(`/api/rpa/progress/${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch job progress")
      }

      const progressData = await response.json()

      setProgress(progressData.progress || 0)
      setCurrentStep(progressData.message || "Processing...")

      // If job is complete or failed, stop polling
      if (
        progressData.status === "docking_complete" ||
        progressData.status === "error" ||
        progressData.progress >= 100
      ) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }

        // Redirect to results page after a short delay
        setTimeout(() => {
          router.push(`/dashboard/jobs/${id}`)
        }, 2000)
      }
    } catch (error) {
      console.error("Error fetching job progress:", error)
    }
  }

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  return (
    <DashboardShell>
      <DashboardHeader heading="New Docking Job" text="Configure and run a new molecular docking simulation." />

      {!showProgress ? (
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Job Configuration</CardTitle>
              <CardDescription>Upload molecule files and configure grid parameters for docking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="job-name">Job Name</Label>
                <Input
                  id="job-name"
                  placeholder="Enter a name for this docking job"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Files (mol2 or pdb format)</Label>
                <FileUpload onFilesChange={handleFileChange} acceptedFileTypes={[".mol2", ".pdb"]} multiple={true} />
                <p className="text-xs text-muted-foreground">Upload one or more molecule files in mol2 or pdb format</p>
                {files.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Selected Files ({files.length}):</p>
                    <ul className="mt-1 text-sm text-muted-foreground">
                      {Array.from(files).map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Tabs defaultValue="grid" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="grid">Grid Parameters</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
                </TabsList>
                <TabsContent value="grid" className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Grid Size Configuration</AlertTitle>
                    <AlertDescription>
                      The grid box defines the search space for AutoDock Vina. Default values (30Å) are suitable for
                      most protein-ligand docking scenarios.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="size-x">Grid Size X: {gridSizeX}Å</Label>
                        <Input
                          id="size-x-input"
                          type="number"
                          value={gridSizeX}
                          onChange={(e) => setGridSizeX(Number(e.target.value))}
                          className="w-16"
                          min={10}
                          max={100}
                        />
                      </div>
                      <Slider
                        id="size-x"
                        min={10}
                        max={100}
                        step={1}
                        value={[gridSizeX]}
                        onValueChange={(value) => setGridSizeX(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="size-y">Grid Size Y: {gridSizeY}Å</Label>
                        <Input
                          id="size-y-input"
                          type="number"
                          value={gridSizeY}
                          onChange={(e) => setGridSizeY(Number(e.target.value))}
                          className="w-16"
                          min={10}
                          max={100}
                        />
                      </div>
                      <Slider
                        id="size-y"
                        min={10}
                        max={100}
                        step={1}
                        value={[gridSizeY]}
                        onValueChange={(value) => setGridSizeY(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="size-z">Grid Size Z: {gridSizeZ}Å</Label>
                        <Input
                          id="size-z-input"
                          type="number"
                          value={gridSizeZ}
                          onChange={(e) => setGridSizeZ(Number(e.target.value))}
                          className="w-16"
                          min={10}
                          max={100}
                        />
                      </div>
                      <Slider
                        id="size-z"
                        min={10}
                        max={100}
                        step={1}
                        value={[gridSizeZ]}
                        onValueChange={(value) => setGridSizeZ(value[0])}
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="advanced" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Advanced options will be available in future updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Future versions will include exhaustiveness settings, energy range configurations, and custom
                      scoring functions.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting || files.length === 0}>
                {isSubmitting ? "Submitting..." : "Start Docking"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Processing Job</CardTitle>
            <CardDescription>
              Your molecular docking job is being processed. Please do not close this window.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm font-medium">Current Step:</p>
              <p className="text-sm text-muted-foreground">{currentStep}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  )
}
