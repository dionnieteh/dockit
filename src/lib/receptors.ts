//src/lib/receptors.ts
export async function getReceptors() {
  try {
    const res = await fetch('/api/admin/receptors')
    if (!res.ok) console.error('Failed to load receptors')
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
    return { error: err.message }
  }
}

// export async function updateUser(id: number, data: any) {
//   try {
//     const res = await fetch(`/api/admin/users/${id}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(data),
//     });
//     if (!res.ok) console.error('Failed to update user')
//     return await res.json();
//   } catch (err: any) {
//     return { error: err.message };
//   }
// }

//add receptors 
export async function addReceptor(data: any) {
  try {
    const res = await fetch('/api/admin/receptors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) console.error('Failed to add receptor')
    return res;
  } catch (err: any) {
    return { error: err.message };
  }
}

// // delete user
// export async function deleteUser(id: number) {
//   try {
//     const res = await fetch(`/api/admin/users/${id}`, {
//       method: 'DELETE',
//     });
//     if (!res.ok) console.error('Failed to delete user')
//     return await res.json();
//   } catch (err: any) {
//     return { error: err.message };
//   }
// }

// // count number of users
// export async function getUserCount() {
//   return getUsers().then(users => {
//     if (Array.isArray(users)) {
//       return users.length;
//     } else {
//       console.error('Failed to count users');
//       return 0;
//     }
//   });
// }