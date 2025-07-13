//src/lib/users.ts
export async function getUsers() {
  try {
    const res = await fetch('/api/admin/users')
    if (!res.ok) console.error('Failed to load users')
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
    return { error: err.message }
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
    if (!res.ok) console.error('Failed to update user')
    return await res.json();
  } catch (err: any) {
    return { error: err.message };
  }
}

//add admin 
export async function addAdmin(data: any) {
  try {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) console.error('Failed to add admin')
    return await res.json();
  } catch (err: any) {
    return { error: err.message };
  }
}

//delete user
export async function deleteUser(id: number) {
  try {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) console.error('Failed to delete user')
    return await res.json();
  } catch (err: any) {
    return { error: err.message };
  }
}