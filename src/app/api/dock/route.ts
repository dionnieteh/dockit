// src/app/api/dock/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { prisma } from "@/lib/prisma";
import archiver from "archiver";
import fsSync from "fs";
import { JobStatus } from "@/lib/job-status";
import { supabase } from "@/lib/supabase-server";

const PYTHON_SCRIPTS_DIR = path.join(process.cwd(), "src", "scripts");

class ObabelError extends Error {
  constructor(message: string, public originalError: string) {
    super(message);
    this.name = "ObabelError";
  }
}

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
          status: JobStatus.QUEUED,
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
    const updatedLigandPaths = await convertLigandsToPdbqt(ligandPaths);

    // Step 3: Prepare receptor
    const receptorIds = form.getAll("selectedReceptors") as string[];
    if (receptorIds.length === 0) {
      throw new Error("No receptor IDs provided");
    }
    const receptorPaths = await getReceptorFromSupabase(receptorIds);

    // Step 4: Docking
    for (const receptor of receptorPaths) {
      await dockLigands(updatedLigandPaths, receptor, parsedMetadata, jobId);
    }

    // Step 5: Zip outputs
    const zipPath = path.join(jobDir, "results.zip");
    await zipModel1Outputs(jobDir, zipPath);

    // Upload to Supabase
    const fileData = await fs.readFile(zipPath);
    const uploadName = `${jobMetadata.userId}/results_${jobId}.zip`;

    const { error: uploadError } = await supabase.storage
      .from("docking-result")
      .upload(uploadName, fileData, {
        contentType: "application/zip",
        upsert: true,
      });

    if (uploadError) {
      console.error("Failed to upload results.zip:", uploadError.message);
      throw new Error("Upload to Supabase failed");
    }

    // Step 6: Update DB status
    await prisma.jobs.update({
      where: { id: jobId },
      data: {
        status: JobStatus.COMPLETE,
        completedAt: new Date(),
        downloadPath: uploadName,
      },
    });

    try {
      const receptorTmpDir = path.join(process.cwd(), "receptors");
      await fs.rm(receptorTmpDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.warn("Failed to clean up receptor tmp dir:", cleanupErr);
    }
    return NextResponse.json({ ...jobMetadata, id: jobId });
  } catch (err) {
    let userErrorMessage = "Docking job failed";
    let dbErrorMessage = err instanceof Error ? err.message : String(err);
    
    if (err instanceof ObabelError) {
      userErrorMessage = "File processing failed. Please check your input files for any formatting issues or corruption. Supported formats: .mol2, .pdb";
      dbErrorMessage = err.originalError;
    } else if (err instanceof Error && err.message.toLowerCase().includes('obabel')) {
      userErrorMessage = "File processing failed. Please check your input files for any formatting issues or corruption. Supported formats: .mol2, .pdb";
    }

    await prisma.jobs.update({
      where: { id: jobId },
      data: {
        status: JobStatus.ERROR,
        errorMessage: dbErrorMessage
      },
    });

    try {
      const receptorTmpDir = path.join(process.cwd(), "receptors");
      await fs.rm(receptorTmpDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.warn("Failed to clean up receptor tmp dir:", cleanupErr);
    }

    return NextResponse.json({ status: 500 }, { statusText: userErrorMessage });
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

async function convertLigandsToPdbqt(ligandPaths: string[]): Promise<string[]> {
  const ligandScript = path.join(PYTHON_SCRIPTS_DIR, "prepare_ligand4.py");
  const outputPaths: string[] = [];

  for (let inputPath of ligandPaths) {
    if (inputPath.endsWith(".mol2")) {
      try {
        inputPath = await sanitizeMol2File(inputPath);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new ObabelError(
          "Failed to process .mol2 file. Please check your input files for formatting issues.",
          `Obabel sanitization failed for ${path.basename(inputPath)}: ${errorMessage}`
        );
      }
    }

    const outPath = inputPath.replace(/\.(mol2|pdb)$/, ".pdbqt");
    await runCommand("python3", [ligandScript, "-l", inputPath, "-o", outPath]);
    outputPaths.push(outPath);
  }

  return outputPaths;
}

async function getPreparedReceptorPath(filename: string, rawPath: string): Promise<string> {
  const ext = path.extname(filename).toLowerCase();

  if (ext !== ".pdb") return rawPath;

  const pdbqtPath = rawPath.replace(/\.pdb$/, ".pdbqt");

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

  return pdbqtPath;
}

async function getReceptorFromSupabase(ids: string[]): Promise<string[]> {
  const receptorRecords = await prisma.receptorFile.findMany({
    where: {
      id: {
        in: ids.map(id => parseInt(id)),
      },
    },
    select: {
      filePath: true,
    },
  });

  if (!receptorRecords || receptorRecords.length === 0) {
    throw new Error("No receptor files found in database");
  }

  const preparedPaths: string[] = [];

  for (const record of receptorRecords) {
    const supabasePath = record.filePath;

    const { data, error } = await supabase.storage
      .from("receptors")
      .download(supabasePath);

    if (error || !data) {
      console.error(`Failed to download ${supabasePath}:`, error?.message);
      continue;
    }

    const buffer = await data.arrayBuffer();
    const filename = path.basename(supabasePath);
    // Remove date and time prefix (e.g., "2025-07-17 17:43:18_")
    const sanitizedFilenameBase = filename.replace(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}_/, "").replace(/[: ]/g, "_");
    let sanitizedFilename = sanitizedFilenameBase;
    let counter = 1;
    const receptorDir = path.join(process.cwd(), "receptors");
    while (fsSync.existsSync(path.join(receptorDir, sanitizedFilename))) {
      const ext = path.extname(sanitizedFilenameBase);
      const name = path.basename(sanitizedFilenameBase, ext);
      sanitizedFilename = `${name}_${counter}${ext}`;
      counter++;
    }
    const localPath = path.join(process.cwd(), "receptors", sanitizedFilename);

    // Ensure directory exists
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, Buffer.from(buffer));

    const preparedPath = await getPreparedReceptorPath(sanitizedFilename, localPath);

    preparedPaths.push(preparedPath);
  }

  return preparedPaths;
}

async function dockLigands(ligandPaths: string[], receptorPath: string, config: any, jobId: string) {
  await prisma.jobs.update({
    where: { id: jobId },
    data: {
      status: JobStatus.PROCESSING,
    },
  });

  const receptorBase = path.basename(receptorPath).replace(/\.pdbqt$/, "");

  for (const ligandPath of ligandPaths) {
    const ligandBase = path.basename(ligandPath).replace(/\.pdb$/, "");

    const ligandPdbqt = ligandPath.replace(/\.pdb$/, ".pdbqt");
    const outFile = ligandPdbqt.replace(".pdbqt", "_out.pdbqt");

    const vinaArgs = [
      "--receptor", receptorPath,
      "--ligand", ligandPdbqt,
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

    // 🧪 Extract only MODEL 1 and rename as receptor_ligand.pdb
    const fullOutput = outFile;
    const model1Output = path.join(
      path.dirname(outFile),
      `${receptorBase}_${ligandBase}_model1.pdbqt`
    );

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
        archive.file(filePath, { name: file.replace(".pdbqt", ".pdb") });
      });
      archive.finalize();
    });
  });
}

async function sanitizeMol2File(filePath: string): Promise<string> {
  const sanitizedPath = filePath.replace(/\.mol2$/, ".cleaned.mol2");
  
  try {
    await runCommand("obabel", [filePath, "-O", sanitizedPath]);
    return sanitizedPath;
  } catch (error) {
    const filename = path.basename(filePath);
    throw new Error(`Obabel failed to process ${filename}: ${error instanceof Error ? error.message : String(error)}`);
  }
}