export interface metadata {
  id: string;
  name: string;
  name_full: string;
  file: {
    input: string;
    output: string;
  };
}

export async function extract_addon(meta: metadata, gmad_path: string) {
  const process = Deno.run({
    cmd: [`${gmad_path}`, `extract`, `-file`, `${meta.file.input}`, `-out`, `${meta.file.output}`],
    stdout: "inherit",
    cwd: Deno.cwd(),
  });

  const status = await process.status();

  if (!status.success) return 0;
  return 1;
}
