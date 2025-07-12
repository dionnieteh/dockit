export async function getDefaultParameters() {
  const res = await fetch('/api/parameters')
  if (!res.ok) throw new Error('Failed to load default parameters')
  return await res.json()
}
