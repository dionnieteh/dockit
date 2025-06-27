import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('ligand') as File;
  if (!file) return NextResponse.json({ error: 'No ligand uploaded' }, { status: 400 });

  const uploads = path.join('/tmp', 'uploads');
  await fs.mkdir(uploads, { recursive: true });
  const ligandPdb = path.join(uploads, file.name);
  const ligandPdbqt = ligandPdb.replace(/\.pdb$/, '.pdbqt');

  await fs.writeFile(ligandPdb, Buffer.from(await file.arrayBuffer()));

  // Step 1: convert to pdbqt
  await runCommand('python3', ['prepare_ligand4.py', '-l', ligandPdb, '-o', ligandPdbqt]);

  // Step 2: dock with Vina
  const resultOut = ligandPdbqt.replace('.pdbqt', '_out.pdbqt');
  await runCommand('vina', [
    '--receptor', 'fixed_receptor.pdbqt',
    '--ligand', ligandPdbqt,
    '--out', resultOut,
    '--config', 'grid_config.txt',
    '--exhaustiveness', '8'
  ]);

  const output = await fs.readFile(resultOut, 'utf-8');
  return NextResponse.json({ success: true, result: output });
}

function runCommand(cmd: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const proc = spawn(cmd, args, { env: process.env, stdio: 'inherit' });
    proc.on('close', (code) => {
      code === 0 ? resolve() : reject(`Command ${cmd} exited with ${code}`);
    });
  });
}
