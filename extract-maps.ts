import * as path from "https://deno.land/std/path/mod.ts";

import { PATHS } from "./run.ts";
import { copySync } from "https://deno.land/std@0.160.0/fs/copy.ts";
import { metadata } from "./extract-addon.ts";

export async function get_files(current_path: string, parrent: string = "") {
  const files: string[] = [];

  for await (const entry of Deno.readDir(current_path)) {
    if (entry.isSymlink) continue;
    const entry_path = path.join(parrent, entry.name);

    if (entry.isFile) files.push(entry_path);
    if (!entry.isDirectory) continue;
    files.push(...(await get_files(path.join(current_path, entry.name), entry_path)));
  }

  return files;
}

export async function compress_file(file: string, bzip: string) {
  const process = Deno.run({
    cmd: [`${bzip}`, `${file}`],
    stdout: "inherit",
    cwd: Deno.cwd(),
  });

  const status = await process.status();

  if (!status.success) return 0;
  return 1;
}

export async function extract_maps(maps_meta: metadata[], paths: PATHS) {
  console.log(`\n> Combining Maps`);
  const processed_path = path.join(paths.OUTPUT.MAPS_DIR, "combined");
  const compressed_path = path.join(paths.OUTPUT.MAPS_DIR, "compressed");

  for (const meta of maps_meta) {
    console.log(`>> Processing ${meta.name}`);
    const files = await get_files(meta.file.output);

    for (const file of files) {
      const base_path = path.join(processed_path, path.dirname(file));

      Deno.mkdirSync(base_path, { recursive: true });
      Deno.copyFileSync(path.join(meta.file.output, file), path.join(base_path, path.basename(file)));
    }
  }

  console.log(`\n> Preparing Compressing Maps`);
  copySync(processed_path, compressed_path, { overwrite: true });

  console.log(`\n> Compressing Maps`);
  const files = await get_files(compressed_path);

  for (const file of files) {
    console.log(`>> Compressing | ${file}`);

    const res = await compress_file(path.join(compressed_path, file), paths.BZIP2);
    console.log(`>>> ${res ? "Successfully Compressed" : "Failed Compressing"} | ${file}`);
  }
}
