// src/lib/jobs.ts
export async function addJob(formData: any) {
  try {
    const res = await fetch('/api/dock', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errorBody = await res.json();
      const errorMessage = errorBody.error || `Failed to create job: ${res.status} ${res.statusText}`;
      throw new Error(errorMessage);
    }
    return await res.json();
  } catch (err: any) {
    console.error(err.message);
    return { error: err.message };
  }
}

export async function getJobs() {
  try {
    const res = await fetch('/api/admin/jobs')
    if (!res.ok)
      throw new Error(`Failed to load jobs: ${res.status} ${res.statusText}`);
    const jobs = await res.json();
    return jobs.map((job: any) => ({
      id: job.id,
      name: job.name,
      status: job.status,
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
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      errorMessage: job.errorMessage,
      user: job.user
    }));
  } catch (err: any) {
    console.error(err.message)
    return { error: err.message }
  }
}

export async function getJobsByUser(userId: string) {
  try {
    const res = await fetch(`/api/job/${userId}}`)
    if (!res.ok)
      throw new Error(`Failed to fetch jobs by user: ${res.status} ${res.statusText}`);
    const jobs = await res.json();
    const parsedJobs = jobs.map((job: any) => ({
      id: job.id,
      name: job.name,
      status: job.status,
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
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      downloadPath: job.downloadPath,
      userId: job.user.userId
    }));

    return {
      count: parsedJobs.length,
      jobs: parsedJobs
    };
  } catch (err: any) {
    console.error(err.message)
    return { error: err.message }
  }
}

export async function getJobCount(): Promise<number | { error: string }> {
  try {
    const jobs = await getJobs();

    if (Array.isArray(jobs)) {
      return jobs.length;
    } else {
      throw new Error('Failed to count jobs');
    }
  } catch (err: any) {
    console.error(err.message);
    return { error: err.message };
  }
}