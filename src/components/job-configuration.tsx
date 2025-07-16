"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { capitalize, formatDateTimeMY } from "@/lib/utils";
import { getJobs } from "@/lib/jobs";
import { User } from "@prisma/client";

interface Job {
  id: number;
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
  user: User;
}

export function JobConfiguration() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const params = await getJobs();
      const transformed: Job[] = params.map((job: any) => ({
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
        user: job.user
      }));
      setJobs(transformed);
    } catch (err) {
      console.error("Failed to fetch docking jobs", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="px-4">Loading jobs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Configuration</CardTitle>
        <CardDescription>Displaying all molecular docking jobs.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Name</TableHead>
              <TableHead>Grid Size X</TableHead>
              <TableHead>Grid Size Y</TableHead>
              <TableHead>Grid Size Z</TableHead>
              <TableHead>Center X</TableHead>
              <TableHead>Center Y</TableHead>
              <TableHead>Center Z</TableHead>
              <TableHead>Energy Range</TableHead>
              <TableHead>Exhaustiveness</TableHead>
              <TableHead>Number Modes</TableHead>
              <TableHead>Verbosity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Error</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Completed At</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
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
                <TableCell>{job.status}</TableCell>
                <TableCell>{job.errorMessage}</TableCell>
                <TableCell>{formatDateTimeMY(new Date(job.createdAt))}</TableCell>
                <TableCell>{job.completedAt ? formatDateTimeMY(new Date(job.completedAt)) : ""}</TableCell>
                <TableCell>{`${capitalize(job.user.firstName)}: ${job.user.email}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
