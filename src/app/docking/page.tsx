// src/app/docking/page.tsx
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
import { getDefaultParameters } from '@/lib/param'
import { addJob } from "@/lib/jobs";
import { TOAST } from "@/lib/toast-messages";
import { getReceptorCount, getReceptors } from "@/lib/receptors";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronDown } from "lucide-react"

export default function NewJobPage() {
  const [defaultParams, setDefaultParams] = useState<any | null>(null)
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [gridSizeX, setGridSizeX] = useState<number>(30)
  const [gridSizeY, setGridSizeY] = useState<number>(30)
  const [gridSizeZ, setGridSizeZ] = useState<number>(30)
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);
  const [centerZ, setCenterZ] = useState<number>(0);
  const [numModes, setNumModes] = useState<number>(10)
  const [energyRange, setEnergyRange] = useState<number>(4)
  const [verbosity, setVerbosity] = useState<number>(1)
  const [exhaustiveness, setExhaustiveness] = useState<number>(8)
  const [jobName, setJobName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; name: string; email: string, role: string } | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [uploadKey, setUploadKey] = useState(0);
  const [receptors, setReceptors] = useState<
    { id: string; name: string; description: string }[]
  >([])
  const [receptorOption, setReceptorOption] = useState<"all" | "select">("all");
  const [selectedReceptorIds, setSelectedReceptorIds] = useState<string[]>([]);


  const { toast } = useToast();

  useEffect(() => {
    const fetchParams = async () => {
      try {
        const params = await getDefaultParameters()
        setDefaultParams(params)
        setGridSizeX(params.gridSizeX)
        setGridSizeY(params.gridSizeY)
        setGridSizeZ(params.gridSizeZ)
        setCenterX(params.centerX)
        setCenterY(params.centerY)
        setCenterZ(params.centerZ)
        setNumModes(params.numModes)
        setEnergyRange(params.energyRange)
        setVerbosity(params.verbosity)
        setExhaustiveness(params.exhaustiveness)
      } catch (err) {
        console.error("Failed to fetch default docking parameters", err)
      }
    }

    fetchParams()
  }, [])

  useEffect(() => {
    const fetchReceptor = async () => {
      try {
        const data = await getReceptors()
        setReceptors(data)
      } catch (err) {
        console.error("Failed to fetch receptors for docking", err)
      }
    }

    fetchReceptor()
  }, [])

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

  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds]);

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  function resetForm() {
    if (!defaultParams) return
    setFiles([])
    setGridSizeX(defaultParams.gridSizeX)
    setGridSizeY(defaultParams.gridSizeY)
    setGridSizeZ(defaultParams.gridSizeZ)
    setCenterX(defaultParams.centerX)
    setCenterY(defaultParams.centerY)
    setCenterZ(defaultParams.centerZ)
    setNumModes(defaultParams.numModes)
    setEnergyRange(defaultParams.energyRange)
    setVerbosity(defaultParams.verbosity)
    setExhaustiveness(defaultParams.exhaustiveness)
    setJobName("")
    setJobId(null)
    setIsSubmitting(false)
    setUploadKey((prev) => prev + 1)
    setRemainingSeconds(null)
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
    formData.append("gridSizeX", gridSizeX.toString());
    formData.append("gridSizeY", gridSizeY.toString());
    formData.append("gridSizeZ", gridSizeZ.toString());
    formData.append("centerX", centerX.toString());
    formData.append("centerY", centerY.toString());
    formData.append("centerZ", centerZ.toString());
    formData.append("numModes", numModes.toString());
    formData.append("energyRange", energyRange.toString());
    formData.append("verbosity", verbosity.toString());
    formData.append("exhaustiveness", exhaustiveness.toString());
    files.forEach((f) => formData.append("files", f));
    formData.append("receptorOption", receptorOption);
    
    if (receptorOption === "select") {
      selectedReceptorIds.forEach(id => formData.append("selectedReceptors", id));
      await countEstTime(files.length, selectedReceptorIds.length);
    } else {
      receptors.forEach(r => formData.append("selectedReceptors", r.id));
      await countEstTime(files.length, receptors.length);
    }

    try {
      const responseData = await addJob(formData);
      if (responseData.error) throw new Error(responseData.error);
      const { id: jobId } = responseData;
      setJobId(jobId);
      toast({
        title: TOAST.DOCKING_PROCESS_SUCCESS.title,
        description: TOAST.DOCKING_PROCESS_SUCCESS.description,
        variant: TOAST.DOCKING_PROCESS_SUCCESS.variant,
      });
    } catch (error: any) {
      toast({
        title: TOAST.DOCKING_PROCESS_ERROR.title,
        description: TOAST.DOCKING_PROCESS_ERROR.description + error.message,
        variant: TOAST.DOCKING_PROCESS_ERROR.variant,
      });
    }

    setIsSubmitting(false);
  }

  async function countEstTime(ligandCount: number, receptorCount: number) {
    const est = ligandCount * receptorCount * 30;
    setRemainingSeconds(est);
  }

  function formatTime(seconds: number | null): string {
    if (seconds === null) return "";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }

  if (!defaultParams || isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (authError || !user) {
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

  const selected = receptors.filter(r => selectedReceptorIds.includes(r.id))

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
            <div className="space-y-4">
              <Label>Receptor Selection</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="all"
                    checked={receptorOption === "all"}
                    onChange={() => setReceptorOption("all")}
                  />
                  Dock with All Receptors
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="select"
                    checked={receptorOption === "select"}
                    onChange={() => setReceptorOption("select")}
                  />
                  Select Specific Receptors
                </label>
              </div>
              {receptorOption == "select" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selected.length > 0
                        ? selected.map((r) => r.name).join(", ")
                        : "Select receptors"}
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full max-h-64 overflow-auto">
                    <div className="flex flex-col gap-1">
                      {receptors.map((r) => {
                        const checked = selectedReceptorIds.includes(r.id)
                        return (
                          <button
                            key={r.id}
                            type="button"
                            className={`flex items-start justify-between text-left rounded p-2 hover:bg-muted/30 transition ${checked ? "bg-muted" : ""
                              }`}
                            onClick={() => {
                              setSelectedReceptorIds((prev) =>
                                checked
                                  ? prev.filter((id) => id !== r.id)
                                  : [...prev, r.id]
                              )
                            }}
                          >
                            <div>
                              <p className="font-medium">{r.name}</p>
                              <p className="text-xs text-muted-foreground">{r.description}</p>
                            </div>
                            {checked && <Check className="h-4 w-4 text-primary" />}
                          </button>
                        )
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || files.length === 0}
              onClick={() => {
                if (jobId) resetForm();
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing... This will take about {formatTime(remainingSeconds)}.
                </>
              ) : jobId ? (
                "Start New Job"
              ) : (
                "Start Docking"
              )
              }
            </Button>

            {jobId && (
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`/api/download/${jobId}`}
                  download={`results_${jobId}.zip`}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Download Results
                </a>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </DashboardShell>
  );
}