"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { capitalize, formatDateTimeMY } from "@/lib/utils";
import { getJobsByUser } from "@/lib/jobs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"
import { JobStatus } from "@/lib/job-status";
import { Button } from "./ui/button";
import { RotateCcw } from "lucide-react";

interface JobHistory {
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
  createdAt: string,
  completedAt?: string;
}

interface JobHistoryProps {
  onJobCountChange?: () => void,
  userId: string;
}

export function JobHistory({ onJobCountChange, userId }: JobHistoryProps) {
  const [jobs, setJobs] = useState<JobHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [jobCount, setJobCount] = useState<number>(0)

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const params = await getJobsByUser(userId);
      const transformed: JobHistory[] = params.jobs.map((job: any) => ({
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
        createdAt: job.createdAt,
        completedAt: job.completedAt,
      }));
      setJobs(transformed);
      setJobCount(params.count);
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
          job.status.toLowerCase().includes(lowerCaseSearchTerm)
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
        <CardTitle>Docking History</CardTitle>
        <CardDescription>Displaying all ({jobCount}) molecular docking jobs. Result files are downloadable for 7 days.</CardDescription>
        <div className="flex flex-col md:flex-row gap-4 mt-4 w-full justify-between">
          <Input
            placeholder="Search by job name or status"
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
                  <TableHead className="font-bold">Created At</TableHead>
                  <TableHead className="font-bold">Completed At</TableHead>
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
                    <TableCell>{formatDateTimeMY(new Date(job.createdAt))}</TableCell>
                    <TableCell>{job.completedAt ? formatDateTimeMY(new Date(job.completedAt)) : ""}</TableCell>
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
