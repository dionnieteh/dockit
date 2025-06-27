//docker-automation-website\src\app\docking\page.tsx
"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { FileUpload } from "@/components/file-upload";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Loader2 } from "lucide-react";

export default function NewJobPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [gridSizeX, setGridSizeX] = useState(30);
  const [gridSizeY, setGridSizeY] = useState(30);
  const [gridSizeZ, setGridSizeZ] = useState(30);
  const [jobName, setJobName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  
  // Authentication states
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsCheckingAuth(true);
      setAuthError(null);

      try {
        const response = await fetch("/api/me", {
          method: 'GET',
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          console.log("User is authenticated:", userData);
        } else {
          // User is not authenticated
          console.error("User is not authenticated, redirecting to login");
          
          // Store the current path for redirect after login
          const currentPath = window.location.pathname;
          router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
          return;
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setAuthError("Failed to verify authentication");
        
        // Redirect to login on error
        setTimeout(() => {
          const currentPath = window.location.pathname;
          router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
        }, 2000);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [router]);

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      alert("Please upload at least one file");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a new job
      const jobResponse = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          name: jobName,
          gridSizeX,
          gridSizeY,
          gridSizeZ,
        }),
      });

      if (!jobResponse.ok) {
        if (jobResponse.status === 401) {
          // Session expired, redirect to login
          router.replace('/login');
          return;
        }
        throw new Error("Failed to create job");
      }

      const jobData = await jobResponse.json();
      const newJobId = jobData.job.id;

      setJobId(newJobId);

      // Upload files
      const formData = new FormData();
      formData.append("jobId", newJobId);

      files.forEach((file) => {
        formData.append("files", file);
      });

      const uploadResponse = await fetch("/api/rpa/upload", {
        method: "POST",
        credentials: 'include',
        body: formData,
      });

      if (!uploadResponse.ok) {
        if (uploadResponse.status === 401) {
          router.replace('/login');
          return;
        }
        throw new Error("Failed to upload files");
      }

      // Start job processing
      const startResponse = await fetch("/api/rpa/start-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          jobId: newJobId,
          gridSizeX,
          gridSizeY,
          gridSizeZ,
        }),
      });

      if (!startResponse.ok) {
        if (startResponse.status === 401) {
          router.replace('/login');
          return;
        }
        throw new Error("Failed to start job processing");
      }

      // Show progress tracking
      setShowProgress(true);

      // Start polling for progress updates
      progressIntervalRef.current = setInterval(() => {
        fetchJobProgress(newJobId);
      }, 2000);
    } catch (error) {
      console.error("Error submitting job:", error);
      alert("An error occurred while submitting the job. Please try again.");
      setIsSubmitting(false);
    }
  };

  const fetchJobProgress = async (id: string) => {
    try {
      const response = await fetch(`/api/rpa/progress/${id}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.replace('/login');
          return;
        }
        throw new Error("Failed to fetch job progress");
      }

      const progressData = await response.json();

      setProgress(progressData.progress || 0);
      setCurrentStep(progressData.message || "Processing...");

      // If job is complete or failed, stop polling
      if (
        progressData.status === "docking_complete" ||
        progressData.status === "error" ||
        progressData.progress >= 100
      ) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }

        // Redirect to results page after a short delay
        setTimeout(() => {
          router.push(`/dashboard/jobs/${id}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Error fetching job progress:", error);
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if authentication check failed
  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{authError}</p>
            <p className="text-sm text-muted-foreground mt-2">Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show main content only if user is authenticated
  if (!user) {
    return null; // This shouldn't happen due to the checks above, but just in case
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="New Docking Job" text="Configure and run a new molecular docking simulation." />

      <div className="mb-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Welcome, {user.name}!</AlertTitle>
          <AlertDescription>
            You are logged in as {user.email}. Configure your molecular docking job below.
          </AlertDescription>
        </Alert>
      </div>

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

              <div className="space-y-4">
                <Label>File Upload</Label>
                <FileUpload onFilesChange={handleFileChange} />
                {files.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {files.length} file(s) selected
                  </div>
                )}
              </div>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Grid Size X: {gridSizeX}</Label>
                      <Slider
                        value={[gridSizeX]}
                        onValueChange={(value) => setGridSizeX(value[0])}
                        max={100}
                        min={10}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Grid Size Y: {gridSizeY}</Label>
                      <Slider
                        value={[gridSizeY]}
                        onValueChange={(value) => setGridSizeY(value[0])}
                        max={100}
                        min={10}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Grid Size Z: {gridSizeZ}</Label>
                      <Slider
                        value={[gridSizeZ]}
                        onValueChange={(value) => setGridSizeZ(value[0])}
                        max={100}
                        min={10}
                        step={1}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Advanced Settings</AlertTitle>
                    <AlertDescription>
                      Additional configuration options will be available here.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting || files.length === 0}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Start Docking"
                )}
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
            {jobId && (
              <div className="text-xs text-muted-foreground">
                Job ID: {jobId}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}