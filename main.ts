import * as READMETXT from "./readme-content.ts";
import * as path from "https://deno.land/std/path/mod.ts";

import { help_message } from "./help.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";
import { run } from "./run.ts";

const cmd = parse(Deno.args);

const CWD = Deno.cwd();
const PATHS = {
  INPUT: {
    ADDONS_DIR: cmd.input?.addons || path.join(CWD, "addons"),
    ADDONS_DIR_SERVER: cmd.input?.addonssrv || path.join(CWD, "addons-server"),
    MAPS_DIR: cmd.input?.maps || path.join(CWD, "maps"),
  },
  OUTPUT: {
    ADDONS_DIR: cmd.output?.addons || path.join(CWD, "extracted/addons"),
    ADDONS_DIR_SERVER: cmd.output?.addonssrv || path.join(CWD, "extracted/addons-server"),
    MAPS_DIR: cmd.output?.maps || path.join(CWD, "extracted/maps"),
  },
  GMAD: cmd.gmad || "gmad",
  BZIP2: cmd.bzip2 || "bzip2",
};

if (cmd.c || cmd["create-folders"]) {
  Deno.mkdirSync(PATHS.INPUT.ADDONS_DIR, { recursive: true });
  Deno.writeTextFileSync(path.join(PATHS.INPUT.ADDONS_DIR, "README.txt"), READMETXT.text_addons);
  Deno.mkdirSync(PATHS.INPUT.ADDONS_DIR_SERVER, { recursive: true });
  Deno.writeTextFileSync(path.join(PATHS.INPUT.ADDONS_DIR_SERVER, "README.txt"), READMETXT.text_addons_server);
  Deno.mkdirSync(PATHS.INPUT.MAPS_DIR, { recursive: true });
  Deno.writeTextFileSync(path.join(PATHS.INPUT.MAPS_DIR, "README.txt"), READMETXT.text_maps);
  Deno.exit(0);
}

if (cmd.v || cmd.version) {
  console.log("GMOD Server Addon Preparer - v1.0.1");
  Deno.exit(0);
}

if (cmd.h || cmd.help) {
  console.log(help_message);
  Deno.exit(0);
}

run(cmd, PATHS);
