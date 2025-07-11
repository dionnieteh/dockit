"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { FileUpload } from "@/components/file-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { defaultDockingConfig } from "@/config/default-params";

export default function NewJobPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [gridSizeX, setGridSizeX] = useState(defaultDockingConfig.gridSizeX);
  const [gridSizeY, setGridSizeY] = useState(defaultDockingConfig.gridSizeY);
  const [gridSizeZ, setGridSizeZ] = useState(defaultDockingConfig.gridSizeZ);
  const [centerX, setCenterX] = useState(defaultDockingConfig.centerX);
  const [centerY, setCenterY] = useState(defaultDockingConfig.centerY);
  const [centerZ, setCenterZ] = useState(defaultDockingConfig.centerZ);
  const [numModes, setNumModes] = useState(defaultDockingConfig.numModes);
  const [energyRange, setEnergyRange] = useState(defaultDockingConfig.energyRange);
  const [verbosity, setVerbosity] = useState(defaultDockingConfig.verbosity);
  const [exhaustiveness, setExhaustiveness] = useState(defaultDockingConfig.exhaustiveness);
  const [jobName, setJobName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [uploadKey, setUploadKey] = useState(0);


  const { toast } = useToast();

  useEffect(() => {
    if (jobId) {
      toast({
        title: "Docking Complete ✅",
        description: "Your job has finished processing!",
      });
    }
  }, [jobId, toast]);

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsCheckingAuth(true);
      setAuthError(null);

      try {
        const response = await fetch("/api/me", {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          const currentPath = window.location.pathname;
          router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
          return;
        }
      } catch (error) {
        setAuthError("Failed to verify authentication");
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

  function resetForm() {
    setFiles([]);
    setGridSizeX(defaultDockingConfig.gridSizeX);
    setGridSizeY(defaultDockingConfig.gridSizeY);
    setGridSizeZ(defaultDockingConfig.gridSizeZ);
    setCenterX(defaultDockingConfig.centerX);
    setCenterY(defaultDockingConfig.centerY);
    setCenterZ(defaultDockingConfig.centerZ);
    setNumModes(defaultDockingConfig.numModes);
    setEnergyRange(defaultDockingConfig.energyRange);
    setVerbosity(defaultDockingConfig.verbosity);
    setExhaustiveness(defaultDockingConfig.exhaustiveness);
    setJobName("");
    setJobId(null);
    setIsSubmitting(false);
    handleFileChange([]);
    setUploadKey(prev => prev + 1); // 👈 force reset FileUpload

  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      alert("Upload at least one PDB");
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("userId", user?.id.toString() || "0");
    formData.append("name", jobName);
    formData.append("gridX", gridSizeX.toString());
    formData.append("gridY", gridSizeY.toString());
    formData.append("gridZ", gridSizeZ.toString());
    formData.append("centerX", centerX.toString());
    formData.append("centerY", centerY.toString());
    formData.append("centerZ", centerZ.toString());
    formData.append("numModes", numModes.toString());
    formData.append("energyRange", energyRange.toString());
    formData.append("verbosity", verbosity.toString());
    formData.append("exhaustiveness", exhaustiveness.toString());
    files.forEach((f) => formData.append("files", f));

    const res = await fetch("/api/dock", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      if (res.status === 401) router.replace("/login");
      else throw new Error("Docking error");
    }

    const { jobId } = await res.json();
    setJobId(jobId);

  }

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

  if (!user) return null;

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
              <FileUpload key={uploadKey} onFilesChange={handleFileChange} />
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
                    <Slider value={[gridSizeX]} onValueChange={(v) => setGridSizeX(v[0])} max={100} min={10} />
                  </div>
                  <div className="space-y-2">
                    <Label>Grid Size Y: {gridSizeY}</Label>
                    <Slider value={[gridSizeY]} onValueChange={(v) => setGridSizeY(v[0])} max={100} min={10} />
                  </div>
                  <div className="space-y-2">
                    <Label>Grid Size Z: {gridSizeZ}</Label>
                    <Slider value={[gridSizeZ]} onValueChange={(v) => setGridSizeZ(v[0])} max={100} min={10} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Advanced Docking Parameters</AlertTitle>
                  <AlertDescription>
                    Fine-tune your docking simulation with these optional parameters.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="center-x">Center X</Label>
                    <Input id="center-x" type="number" step="0.0001" value={centerX} onChange={(e) => setCenterX(parseFloat(e.target.value))} />
                    <Label htmlFor="center-y">Center Y</Label>
                    <Input id="center-y" type="number" step="0.0001" value={centerY} onChange={(e) => setCenterY(parseFloat(e.target.value))} />
                    <Label htmlFor="center-z">Center Z</Label>
                    <Input id="center-z" type="number" step="0.0001" value={centerZ} onChange={(e) => setCenterZ(parseFloat(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="num-modes">Number of Modes</Label>
                    <Input id="num-modes" type="number" value={numModes} onChange={(e) => setNumModes(parseInt(e.target.value))} />
                    <Label htmlFor="energy-range">Energy Range</Label>
                    <Input id="energy-range" type="number" value={energyRange} onChange={(e) => setEnergyRange(parseInt(e.target.value))} />
                    <Label htmlFor="verbosity">Verbosity</Label>
                    <Input id="verbosity" type="number" value={verbosity} onChange={(e) => setVerbosity(parseInt(e.target.value))} />
                    <Label htmlFor="exhaustiveness">Exhaustiveness</Label>
                    <Input id="exhaustiveness" type="number" value={exhaustiveness} onChange={(e) => setExhaustiveness(parseInt(e.target.value))} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4">
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

            {jobId && (
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`/api/download/${jobId}`}
                  download
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Download Results
                </a>
                <Button variant="outline" onClick={resetForm}>
                  Start New Job
                </Button>
              </div>
            )}
          </CardFooter>

        </form>
      </Card>
    </DashboardShell>
  );
}
