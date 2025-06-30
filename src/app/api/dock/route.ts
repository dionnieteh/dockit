import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { spawn } from "child_process" // Make sure this is imported
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

  try {
    const prepareLigandScriptPath = path.join(PYTHON_SCRIPTS_DIR, "prepare_ligand4.py");
    // Convert each ligand pdb to pdbqt
    for (const pdb of ligandFiles) {
      const out = pdb.replace(/\.pdb$/, ".pdbqt")
      await runCommand("python3", [prepareLigandScriptPath, "-l", pdb, "-o", out]);
    }

    // Construct the full path to fixed_receptor.pdbqt, now from src/assets
    const receptorPath = path.join(ASSETS_DIR, "3c5x.pdbqt");

    // Loop through converted pdbqt files and dock each
    for (const pdbqt of ligandFiles.map(p => p.replace(/\.pdb$/, ".pdbqt"))) {
      const vinaArgs = [
        "--receptor", receptorPath,
        "--ligand", pdbqt,
        "--out", pdbqt.replace(".pdbqt", "_out.pdbqt"),
        "--center_x", "0",
        "--center_y", "0",
        "--center_z", "0",
        "--size_x", gridX.toString(),
        "--size_y", gridY.toString(),
        "--size_z", gridZ.toString(),
        "--exhaustiveness", "8",
      ];
      // Pass the arguments as an array to runCommand,
      // but runCommand will now build a single string and use shell: true.
      await runCommand("vina", vinaArgs)
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

// MODIFIED runCommand function
function runCommand(cmd: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    // Construct the full command string by joining arguments with spaces
    // Ensure paths with spaces are quoted if that ever becomes an issue
    const fullCommand = `${cmd} ${args.map(arg => {
        // Simple quoting for paths or args that might contain spaces
        // If your paths/args never contain spaces, arg.includes(' ') ? `"${arg}"` : arg
        // might not be necessary, but it's safer.
        return arg; // For now, assuming no spaces in args/paths
    }).join(' ')}`;

    console.log(`Executing command: ${fullCommand}`); // For debugging

    // Use shell: true to let the shell handle argument parsing
    const proc = spawn(fullCommand, { shell: true, env: process.env, stdio: "inherit" });

    proc.on("close", code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${fullCommand} exited with ${code}`));
      }
    });

    proc.on("error", err => {
        reject(new Error(`Failed to start command ${fullCommand}: ${err.message}`));
    });
  });
}