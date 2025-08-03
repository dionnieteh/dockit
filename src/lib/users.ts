// src/lib/users.ts
export async function checkAuthUser() {
  try {
    const res = await fetch("/api/me", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Not authenticated");
    }
    return await res.json();
  } catch (err: any) {
    console.error(err.message)
    throw err;
  }
}

export async function getUsers() {
  try {
    const res = await fetch('/api/admin/users')
    if (!res.ok)
      throw new Error(`Failed to load users: ${res.status} ${res.statusText}`);
    const users = await res.json();
    return users.map((user: any) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      institution: user.institution,
      purpose: user.purpose,
    }));
  } catch (err: any) {
    console.error(err.message)
    throw err;
  }
}

export async function updateUser(id: number, data: any) {
  try {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok)
      throw new Error(`Failed to update user: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err: any) {
    console.error(err.message)
    throw err;
  }
}

export async function addAdmin(data: any) {
  try {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok)
      throw new Error(`Failed to add admin: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err: any) {
    console.error(err.message)
    throw err;
  }
}

export async function deleteUser(id: number) {
  try {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok)
      throw new Error(`Failed to delete user: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err: any) {
    console.error(err.message)
    throw err;
  }
}

export async function getUserCount(): Promise<number | { error: string }> {
  try {
    const users = await getUsers();

    if (Array.isArray(users)) {
      return users.length;
    } else {
      throw new Error('Failed to count users');
    }
  } catch (err: any) {
    console.error(err.message);
    throw err;
  }
}