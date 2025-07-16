// src/lib/jobs.ts
export async function addJob(formData: any) {
  try {
    const res = await fetch('/api/dock', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok)
      throw new Error(`Failed to create job: ${res.status} ${res.statusText}`);
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

export async function getJobCount() {
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

