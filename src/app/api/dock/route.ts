import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { prisma } from "@/lib/prisma";

const PYTHON_SCRIPTS_DIR = path.join(process.cwd(), "src", "scripts");
const ASSETS_DIR = path.join(process.cwd(), "src", "assets");

export async function POST(req: Request) {
  const form = await req.formData();
  const jobMetadata = parseJobMetadata(form);
  const files = form.getAll("files") as File[];

  const job = await createJobInDB(jobMetadata);
  const jobDir = path.join("/tmp", job.id.toString());
  await saveUploadedFiles(files, jobDir);

  const ligandPaths = files.map((f) => path.join(jobDir, f.name));

  try {
    await convertLigandsToPdbqt(ligandPaths);

    const receptorPath = await getPreparedReceptorPath("3c5x.pdb");

    await dockLigands(ligandPaths, receptorPath, jobMetadata);

    await prisma.job.update({
      where: { id: job.id },
      data: { status: "complete", completedAt: new Date() },
    });

    return NextResponse.json({ jobId: job.id, success: true });
  } catch (err) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "error", errorMessage: (err as Error).message },
    });
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

// -------------------- Utility Functions --------------------

function parseJobMetadata(form: FormData) {
  return {
    userId: parseInt(form.get("userId") as string),
    name: form.get("name") as string,
    gridSizeX: parseInt(form.get("gridX") as string),
    gridSizeY: parseInt(form.get("gridY") as string),
    gridSizeZ: parseInt(form.get("gridZ") as string),
    centerX: parseFloat(form.get("centerX") as string),
    centerY: parseFloat(form.get("centerY") as string),
    centerZ: parseFloat(form.get("centerZ") as string),
    numModes: parseInt(form.get("numModes") as string),
    energyRange: parseInt(form.get("energyRange") as string),
    verbosity: parseInt(form.get("verbosity") as string),
    exhaustiveness: parseInt(form.get("exhaustiveness") as string),
  };
}

async function createJobInDB(metadata: any) {
  return await prisma.job.create({
    data: {
      name: metadata.name,
      status: "processing",
      gridSizeX: metadata.gridSizeX,
      gridSizeY: metadata.gridSizeY,
      gridSizeZ: metadata.gridSizeZ,
      updatedAt: new Date(),
      userId: metadata.userId,
    },
  });
}

async function saveUploadedFiles(files: File[], jobDir: string) {
  await fs.mkdir(jobDir, { recursive: true });
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(jobDir, file.name), buffer);
  }
}

async function convertLigandsToPdbqt(ligandPaths: string[]) {
  const ligandScript = path.join(PYTHON_SCRIPTS_DIR, "prepare_ligand4.py");
  for (const pdb of ligandPaths) {
    const out = pdb.replace(/\.pdb$/, ".pdbqt");
    await runCommand("python3", [ligandScript, "-l", pdb, "-o", out]);
  }
}

async function getPreparedReceptorPath(filename: string): Promise<string> {
  const ext = path.extname(filename).toLowerCase();
  const rawPath = path.join(ASSETS_DIR, filename);

  if (ext !== ".pdb") return rawPath;

  const pdbqtPath = rawPath.replace(/\.pdb$/, ".pdbqt");
  try {
    await fs.access(pdbqtPath); // Exists
    console.log("Using existing receptor PDBQT:", pdbqtPath);
  } catch {
    console.log("Converting receptor PDB to PDBQT...");
    const script = path.join(PYTHON_SCRIPTS_DIR, "prepare_receptor4.py");
    await runCommand("python3", [
      script,
      "-r",
      rawPath,
      "-o",
      pdbqtPath,
      "-A",
      "checkhydrogens",
    ]);
  }

  return pdbqtPath;
}

async function dockLigands(ligandPaths: string[], receptorPath: string, config: any) {
  for (const pdbqt of ligandPaths.map((p) => p.replace(/\.pdb$/, ".pdbqt"))) {
    const outFile = pdbqt.replace(".pdbqt", "_out.pdbqt");

    const vinaArgs = [
      "--receptor", receptorPath,
      "--ligand", pdbqt,
      "--out", outFile,
      "--center_x", config.centerX.toString(),
      "--center_y", config.centerY.toString(),
      "--center_z", config.centerZ.toString(),
      "--size_x", config.gridSizeX.toString(),
      "--size_y", config.gridSizeY.toString(),
      "--size_z", config.gridSizeZ.toString(),
      "--num_modes", config.numModes.toString(),
      "--energy_range", config.energyRange.toString(),
      "--verbosity", config.verbosity.toString(),
      "--exhaustiveness", config.exhaustiveness.toString(),
    ];

    await runCommand("vina", vinaArgs);

    // 🧪 Extract only MODEL 1
    const fullOutput = pdbqt.replace(".pdbqt", "_out.pdbqt");
    const model1Output = pdbqt.replace(".pdbqt", "_model1.pdbqt");

    await extractModel1Only(fullOutput, model1Output);
  }
}

function runCommand(cmd: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const fullCommand = `${cmd} ${args.join(" ")}`;
    console.log(`Executing command: ${fullCommand}`);

    const proc = spawn(fullCommand, {
      shell: true,
      env: process.env,
      stdio: "inherit",
    });

    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${fullCommand} exited with ${code}`));
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to start command ${fullCommand}: ${err.message}`));
    });
  });
}

async function extractModel1Only(inputPath: string, outputPath: string) {
  const content = await fs.readFile(inputPath, "utf-8");

  const model1 = content.split(/MODEL\s+1[\r\n]+/)[1]?.split(/ENDMDL/)[0];
  if (!model1) throw new Error("MODEL 1 not found in output");

  const finalContent = `MODEL 1\n${model1.trim()}\nENDMDL\n`;
  await fs.writeFile(outputPath, finalContent, "utf-8");
}

