export async function getDefaultParameters() {
  try {
    const res = await fetch('/api/admin/parameters')
    if (!res.ok) console.error('Failed to load default parameters')
    return await res.json()
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateDefaultParameter(name: string, value: string) {
  try {
    const res = await fetch('/api/admin/parameters', {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ [name]: value }),
    })

    if (!res.ok) console.error("Failed to update parameter")
    return await res.json()
  } catch (err: any) {
    return { error: err.message }
  }
}
