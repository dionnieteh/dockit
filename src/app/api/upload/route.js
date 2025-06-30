// app/api/upload/route.js

import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdirSync } from 'fs';

const execPromise = promisify(exec);

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('ligand');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), 'uploads');
  mkdirSync(uploadsDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filePath = path.join(uploadsDir, file.name);
  const pdbqtPath = filePath.replace('.pdb', '.pdbqt');

  await writeFile(filePath, buffer);

  try {
    // Run prepare_ligand4.py to convert to .pdbqt
    await execPromise(`python3 /scripts/prepare_ligand4.py -l ${filePath} -o ${pdbqtPath}`);

    // Run docking script
    const { stdout } = await execPromise(`perl docking_script.pl ${pdbqtPath}`);

    return NextResponse.json({
      message: 'Docking complete',
      result: stdout,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Docking failed', details: error.message }, { status: 500 });
  }
}
