"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { capitalize, formatDateTimeMY } from "@/lib/utils";
import { getJobs } from "@/lib/jobs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"
import { JobStatus } from "@/lib/job-status";
import { Button } from "./ui/button";
import { RotateCcw } from "lucide-react";

interface Job {
  id: string;
  name: string;
  gridSizeX: number;
  gridSizeY: number;
  gridSizeZ: number;
  centerX: number;
  centerY: number;
  centerZ: number;
  energyRange: number;
  exhaustiveness: number;
  numModes: number;
  verbosity: number;
  status: string;
  errorMessage?: string;
  createdAt: string,
  completedAt?: string;
  user: {
    firstName: string;
    email: string;
  };
}

interface JobManagementProps {
  onJobCountChange?: () => void
}

export function JobConfiguration({ onJobCountChange }: JobManagementProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const params = await getJobs();
      const transformed: Job[] = params.map((job: any) => ({
        id: job.id,
        name: job.name,
        gridSizeX: job.gridSizeX,
        gridSizeY: job.gridSizeY,
        gridSizeZ: job.gridSizeZ,
        centerX: job.centerX,
        centerY: job.centerY,
        centerZ: job.centerZ,
        energyRange: job.energyRange,
        exhaustiveness: job.exhaustiveness,
        numModes: job.numModes,
        verbosity: job.verbosity,
        status: job.status,
        errorMessage: job.errorMessage,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        user: {
          firstName: job.user.firstName,
          email: job.user.email,
        },
      }));
      setJobs(transformed);
    } catch (err) {
      console.error("Failed to fetch docking jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    let currentJobs = jobs;

    if (filterStatus !== "All") {
      currentJobs = currentJobs.filter((job) => job.status === filterStatus);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentJobs = currentJobs.filter(
        (job) =>
          job.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          job.status.toLowerCase().includes(lowerCaseSearchTerm) ||
          (job.errorMessage && job.errorMessage.toLowerCase().includes(lowerCaseSearchTerm)) ||
          job.user.firstName.toLowerCase().includes(lowerCaseSearchTerm) ||
          job.user.email.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    return currentJobs;
  }, [jobs, searchTerm, filterStatus]);

  const jobStatuses = useMemo(() => {
    return ["All", ...Object.values(JobStatus)];
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Docking Jobs</CardTitle>
        <CardDescription>Displaying all molecular docking jobs within the past 7 days</CardDescription>
        <div className="flex flex-col md:flex-row gap-4 mt-4 w-full justify-between">
          <Input
            placeholder="Search by job name, status, error, user first name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {jobStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setLoading(true)
              fetchJobs()
              onJobCountChange?.()
            }}
            disabled={loading}
          >
            <RotateCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="px-4">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-500">No jobs performed.</p>
        ) : filteredJobs.length === 0 ? (
          <p className="text-center text-gray-500">No jobs found matching your criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Job Name</TableHead>
                  <TableHead className="font-bold">Grid Size X</TableHead>
                  <TableHead className="font-bold">Grid Size Y</TableHead>
                  <TableHead className="font-bold">Grid Size Z</TableHead>
                  <TableHead className="font-bold">Center X</TableHead>
                  <TableHead className="font-bold">Center Y</TableHead>
                  <TableHead className="font-bold">Center Z</TableHead>
                  <TableHead className="font-bold">Energy Range</TableHead>
                  <TableHead className="font-bold">Exhaustiveness</TableHead>
                  <TableHead className="font-bold">Number Modes</TableHead>
                  <TableHead className="font-bold">Verbosity</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Error</TableHead>
                  <TableHead className="font-bold">Created At</TableHead>
                  <TableHead className="font-bold">Completed At</TableHead>
                  <TableHead className="font-bold">User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{capitalize(job.name)}</TableCell>
                    <TableCell>{job.gridSizeX}</TableCell>
                    <TableCell>{job.gridSizeY}</TableCell>
                    <TableCell>{job.gridSizeZ}</TableCell>
                    <TableCell>{job.centerX}</TableCell>
                    <TableCell>{job.centerY}</TableCell>
                    <TableCell>{job.centerZ}</TableCell>
                    <TableCell>{job.energyRange}</TableCell>
                    <TableCell>{job.exhaustiveness}</TableCell>
                    <TableCell>{job.numModes}</TableCell>
                    <TableCell>{job.verbosity}</TableCell>
                    <TableCell>{capitalize(job.status)}</TableCell>
                    <TableCell>{job.errorMessage}</TableCell>
                    <TableCell>{formatDateTimeMY(new Date(job.createdAt))}</TableCell>
                    <TableCell>{job.completedAt ? formatDateTimeMY(new Date(job.completedAt)) : ""}</TableCell>
                    <TableCell>{`${capitalize(job.user.firstName)}: ${job.user.email}`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
