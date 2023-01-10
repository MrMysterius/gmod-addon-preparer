import * as path from "https://deno.land/std/path/mod.ts";

import { extract_addon, metadata } from "./extract-addon.ts";

import { extract_maps } from "./extract-maps.ts";

export interface PATHS {
  INPUT: {
    ADDONS_DIR: string;
    ADDONS_DIR_SERVER: string;
    MAPS_DIR: string;
  };
  OUTPUT: {
    ADDONS_DIR: string;
    ADDONS_DIR_SERVER: string;
    MAPS_DIR: string;
  };
  GMAD: string;
  BZIP2: string;
}

export interface CMD {
  [key: string]: any;
}

export async function run(cmd: CMD, paths: PATHS) {
  console.log("\n> Removing/Deleting Extract Folders");

  try {
    console.log(`>> Deleting Addons | ${paths.OUTPUT.ADDONS_DIR}`);
    Deno.removeSync(paths.OUTPUT.ADDONS_DIR, { recursive: true });
    console.log(`>> Deleting Addons Server | ${paths.OUTPUT.ADDONS_DIR_SERVER}`);
    Deno.removeSync(paths.OUTPUT.ADDONS_DIR_SERVER, { recursive: true });
    console.log(`>> Deleting Maps | ${paths.OUTPUT.MAPS_DIR}`);
    Deno.removeSync(paths.OUTPUT.MAPS_DIR, { recursive: true });
  } catch (error) {
    console.log(`# Error Removing/Deleting Extract Folders | \n${error}`);
  }

  console.log("\n> Creating Extract Folders");
  console.log(`>> Creating Addons | ${paths.OUTPUT.ADDONS_DIR}`);
  Deno.mkdirSync(paths.INPUT.ADDONS_DIR, { recursive: true });
  console.log(`>> Creating Addons Server | ${paths.OUTPUT.ADDONS_DIR_SERVER}`);
  Deno.mkdirSync(paths.INPUT.ADDONS_DIR_SERVER, { recursive: true });
  console.log(`>> Creating Maps | ${paths.OUTPUT.MAPS_DIR}`);
  Deno.mkdirSync(paths.INPUT.MAPS_DIR, { recursive: true });

  const PROCESSED: { addons: metadata[]; addons_server: metadata[]; maps: metadata[] } = { addons: [], addons_server: [], maps: [] };

  console.log(`\n> Extracting Addons | ${paths.INPUT.ADDONS_DIR}`);

  for await (const dirEntry of Deno.readDir(paths.INPUT.ADDONS_DIR)) {
    if (!dirEntry.isFile || dirEntry.isSymlink) continue;

    const extract = /^((.+)_(\d+))\.gma$/.exec(dirEntry.name);

    if (!extract) continue;

    const meta: metadata = {
      id: extract[3],
      name: extract[2],
      name_full: extract[1],
      file: {
        input: path.join(paths.INPUT.ADDONS_DIR, extract[0]),
        output: path.join(paths.OUTPUT.ADDONS_DIR, extract[1]),
      },
    };

    PROCESSED.addons.push(meta);

    console.log(`\n>> Extracting Addon | ${meta.name_full}`);

    const res = await extract_addon(meta, paths.GMAD);

    console.log(`>>> ${res ? "Successfully Extracted" : "Failed to Extract"} Addon | ${meta.name_full}`);
  }

  console.log(`\n> Extracting Addons Server | ${paths.INPUT.ADDONS_DIR_SERVER}`);

  for await (const dirEntry of Deno.readDir(paths.INPUT.ADDONS_DIR_SERVER)) {
    if (!dirEntry.isFile || dirEntry.isSymlink) continue;

    const extract = /^((.+)_(\d+))\.gma$/.exec(dirEntry.name);

    if (!extract) continue;

    const meta: metadata = {
      id: extract[3],
      name: extract[2],
      name_full: extract[1],
      file: {
        input: path.join(paths.INPUT.ADDONS_DIR_SERVER, extract[0]),
        output: path.join(paths.OUTPUT.ADDONS_DIR_SERVER, extract[1]),
      },
    };

    PROCESSED.addons_server.push(meta);

    console.log(`\n>> Extracting Addon | ${meta.name_full}`);

    const res = await extract_addon(meta, paths.GMAD);

    console.log(`>>> ${res ? "Successfully Extracted" : "Failed to Extract"} Addon Server | ${meta.name_full}`);
  }

  console.log(`\n> Extracting Maps | ${paths.INPUT.MAPS_DIR}`);

  for await (const dirEntry of Deno.readDir(paths.INPUT.MAPS_DIR)) {
    if (!dirEntry.isFile || dirEntry.isSymlink) continue;

    const extract = /^((.+)_(\d+))\.gma$/.exec(dirEntry.name);

    if (!extract) continue;

    const meta: metadata = {
      id: extract[3],
      name: extract[2],
      name_full: extract[1],
      file: {
        input: path.join(paths.INPUT.MAPS_DIR, extract[0]),
        output: path.join(paths.OUTPUT.MAPS_DIR, "raw", extract[1]),
      },
    };

    PROCESSED.maps.push(meta);

    console.log(`\n>> Extracting Addon | ${meta.name_full}`);

    const res = await extract_addon(meta, paths.GMAD);

    console.log(`>>> ${res ? "Successfully Extracted" : "Failed to Extract"} Map | ${meta.name_full}`);
  }

  console.log(`\n> Creating Autorun workshop.lua`);
  Deno.writeTextFileSync(path.join(paths.OUTPUT.ADDONS_DIR, "../workshop.lua"), "");

  for (let meta of PROCESSED.addons) {
    console.log(`>> resource.AddWorkshop("${meta.id}") -- ${meta.name}`);
    Deno.writeTextFileSync(path.join(paths.OUTPUT.ADDONS_DIR, "../workshop.lua"), `resource.AddWorkshop("${meta.id}") -- ${meta.name}\n`, { append: true });
  }

  extract_maps(PROCESSED.maps, paths);
}
