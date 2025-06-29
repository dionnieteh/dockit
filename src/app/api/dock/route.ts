import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { spawn } from "child_process"
import { prisma } from "@/lib/prisma"

const PYTHON_SCRIPTS_DIR = path.join(process.cwd(), "src", "scripts");
const ASSETS_DIR = path.join(process.cwd(), "src", "assets");

export async function POST(req: Request) {
  const form = await req.formData()

  // Job metadata
  const userId = parseInt(form.get("userId") as string)
  const name = form.get("name") as string
  const gridX = parseInt(form.get("gridX") as string)
  const gridY = parseInt(form.get("gridY") as string)
  const gridZ = parseInt(form.get("gridZ") as string)
  const files = form.getAll("files") as File[]

  const job = await prisma.job.create({
    data: {
      name: name,
      status: "processing",
      gridSizeX: gridX,
      gridSizeY: gridY,
      gridSizeZ: gridZ,
      updatedAt: new Date(),
      userId: userId,
    },
  })

  const jobDir = path.join("/tmp", job.id)
  await fs.mkdir(jobDir, { recursive: true })

  // Save uploaded files
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(path.join(jobDir, file.name), buffer)
  }

  const ligandFiles = files.map(f => path.join(jobDir, f.name))
  const gridConfig = `${gridX} ${gridY} ${gridZ}`

  try {
    const prepareLigandScriptPath = path.join(PYTHON_SCRIPTS_DIR, "prepare_ligand4.py");
    // Convert each ligand pdb to pdbqt
    for (const pdb of ligandFiles) {
      const out = pdb.replace(/\.pdb$/, ".pdbqt")
      await runCommand("python", [prepareLigandScriptPath, "-l", pdb, "-o", out]);
    }

    // Construct the full path to fixed_receptor.pdbqt, now from src/assets
    const receptorPath = path.join(ASSETS_DIR, "3c5x.pdbqt");

    // Loop through converted pdbqt files and dock each
    for (const pdbqt of ligandFiles.map(p => p.replace(/\.pdb$/, ".pdbqt"))) {
      await runCommand("vina", [
        "--receptor", receptorPath,
        "--ligand", pdbqt,
        "--out", pdbqt.replace(".pdbqt", "_out.pdbqt"),
        "--config", `--center_x 0 --center_y 0 --center_z 0 --size_x ${gridX} --size_y ${gridY} --size_z ${gridZ}`,
        "--exhaustiveness", "8",
      ])
    }

    // On success
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "complete", completedAt: new Date() },
    })

    return NextResponse.json({ jobId: job.id, success: true })
  } catch (err) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "error", errorMessage: (err as Error).message },
    })
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
}

function runCommand(cmd: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const proc = spawn(cmd, args, { env: process.env, stdio: "inherit" })
    proc.on("close", code => (code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`))))
  })
}
