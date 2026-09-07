import { readdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = new URL('../asset/', import.meta.url);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.name.toLowerCase().endsWith('.webp')) files.push(path);
  }
  return files;
}

for (const source of await walk(root.pathname)) {
  const output = join(parse(source).dir, `${parse(source).name}.avif`);
  await run('magick', [source, '-quality', '60', output]);
  const result = await stat(output);
  console.log(`${output}: ${result.size} bytes`);
}
