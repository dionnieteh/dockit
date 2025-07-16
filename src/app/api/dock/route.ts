// src/app/api/dock/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { prisma } from "@/lib/prisma";
import archiver from "archiver";
import fsSync from "fs";

const PYTHON_SCRIPTS_DIR = path.join(process.cwd(), "src", "scripts");
const ASSETS_DIR = path.join(process.cwd(), "src", "assets");

export async function POST(req: Request) {
  var jobId = "0"
  try {
    const form = await req.formData();
    const parsedMetadata = parseJobMetadata(form);
    const ligandFiles = form.getAll("files") as File[];

    if (!ligandFiles.length) {
      return NextResponse.json({ error: "No ligand files uploaded" }, { status: 400 });
    }
    console.log(parsedMetadata)
    // Step 1: Create job entry in DB
    const jobMetadata = await prisma.jobs.create(
      {
        data: {
          userId: parsedMetadata.userId,
          name: parsedMetadata.name,
          gridSizeX: parsedMetadata.gridSizeX,
          gridSizeY: parsedMetadata.gridSizeY,
          gridSizeZ: parsedMetadata.gridSizeZ,
          status: "queued",
          centerX: parsedMetadata.centerX,
          centerY: parsedMetadata.centerY,
          centerZ: parsedMetadata.centerZ,
          energyRange: parsedMetadata.energyRange,
          exhaustiveness: parsedMetadata.exhaustiveness,
          numModes: parsedMetadata.numModes,
          verbosity: parsedMetadata.verbosity,
          createdAt: new Date,
        },
      }
    )

    jobId = jobMetadata.id;
    console.log(jobId)
    const jobDir = path.join(process.cwd(), "jobs", `job-${jobId}`);
    await saveUploadedFiles(ligandFiles, jobDir);

    // Step 2: Convert ligands
    const ligandPaths = ligandFiles.map(file => path.join(jobDir, file.name));
    await convertLigandsToPdbqt(ligandPaths);

    // Step 3: Prepare receptor
    const receptorPath = await getPreparedReceptorPath("3c5x.pdb");

    // Step 4: Docking
    await dockLigands(ligandPaths, receptorPath, parsedMetadata, jobId);

    // Step 5: Zip outputs
    const zipPath = path.join(jobDir, "results.zip");
    await zipModel1Outputs(jobDir, zipPath);

    // Step 6: Update DB status
    await prisma.jobs.update({
      where: { id: jobId },
      data: {
        status: "complete",
        completedAt: new Date()
      },
    });
    return NextResponse.json({ ...jobMetadata, id: jobId });
  } catch (err) {
    await prisma.jobs.update({
      where: { id: jobId },
      data: {
        status: "error",
        errorMessage: err instanceof Error ? err.message : String(err)
      },
    });
    return NextResponse.json({ error: "Docking job failed" + err });
  }
}

function parseJobMetadata(form: FormData) {
  return {
    userId: parseInt(form.get("userId") as string),
    name: form.get("name") as string,
    gridSizeX: parseInt(form.get("gridSizeX") as string),
    gridSizeY: parseInt(form.get("gridSizeY") as string),
    gridSizeZ: parseInt(form.get("gridSizeZ") as string),
    centerX: parseFloat(form.get("centerX") as string),
    centerY: parseFloat(form.get("centerY") as string),
    centerZ: parseFloat(form.get("centerZ") as string),
    numModes: parseInt(form.get("numModes") as string),
    energyRange: parseInt(form.get("energyRange") as string),
    verbosity: parseInt(form.get("verbosity") as string),
    exhaustiveness: parseInt(form.get("exhaustiveness") as string),
  };
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

async function dockLigands(ligandPaths: string[], receptorPath: string, config: any, jobId: string) {
  await prisma.jobs.update({
    where: { id: jobId },
    data: {
      status: "processing",
    },
  });
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
  try {
    const content = await fs.readFile(inputPath, "utf-8");

    const model1 = content.split(/MODEL\s+1[\r\n]+/)[1]?.split(/ENDMDL/)[0];
    if (!model1) throw new Error(`MODEL 1 not found in ${inputPath}`);

    const finalContent = `MODEL 1\n${model1.trim()}\nENDMDL\n`;
    await fs.writeFile(outputPath, finalContent, "utf-8");
  } catch (err) {
    throw new Error(`Failed to extract MODEL 1 from ${inputPath}: ${err}`);
  }
}

async function zipModel1Outputs(jobDir: string, zipPath: string) {
  return new Promise<void>((resolve, reject) => {
    const output = fsSync.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);

    // Only include _model1.pdbqt files
    fs.readdir(jobDir).then((files) => {
      files.filter((f) => f.endsWith("_model1.pdbqt")).forEach((file) => {
        const filePath = path.join(jobDir, file);
        archive.file(filePath, { name: file });
      });
      archive.finalize();
    });
  });
}