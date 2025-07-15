//src/lib/receptors.ts
export async function getReceptors() {
  try {
    const res = await fetch('/api/admin/receptors')
    if (!res.ok)
      throw new Error(`Failed to load receptors: ${res.status} ${res.statusText}`);
    const receptors = await res.json();
    return receptors.map((receptor: any) => ({
      id: receptor.id,
      name: receptor.name,
      description: receptor.description,
      filePath: receptor.filePath,
      fileSize: receptor.fileSize,
      uploadedOn: receptor.uploadedOn,
    }));
  } catch (err: any) {
    console.error(err.message)
    return { error: err.message }
  }
}

export async function updateReceptor(id: number, data: any) {
  try {
    const res = await fetch(`/api/admin/receptors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok)
      throw new Error(`Failed to update receptor: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err: any) {
    console.error(err.message)
    return { error: err.message };
  }
}

export async function addReceptor(data: any) {
  try {
    const res = await fetch('/api/admin/receptors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok)
      throw new Error(`Failed to add receptor: ${res.status} ${res.statusText}`);
    return res;
  } catch (err: any) {
    console.error(err.message)
    return { error: err.message };
  }
}

export async function deleteReceptor(id: number) {
  try {
    const res = await fetch(`/api/admin/receptors/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok)
      throw new Error(`Failed to delete receptor: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err: any) {
    console.error(err.message)
    return { error: err.message };
  }
}

export async function getReceptorCount(): Promise<number | { error: string }> {
  try {
    const files = await getReceptors();
    
    if (Array.isArray(files)) {
      return files.length;
    } else {
      throw new Error('Failed to count receptor files');
    }
  } catch (err: any) {
    console.error(err.message);
    return { error: err.message };
  }
}