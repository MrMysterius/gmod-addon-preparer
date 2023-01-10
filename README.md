# GMOD Addon Preparer

## Prerequisites

You will need pre-installed on your machine / accessible:

- gmad(.exe) - usually found in gmods tools folder
- bzip2(.exe) - mostlikely need to be downloaded from the official site

## Usage / Arguments

For the first use you should do:

```bash
./gmod-addon-prep.exe -c
```

This will create the folders for the `.gma` files (addon archives) from which extraction will be done.
Once you have added your addons to the folders just run the tool basically raw:

```bash
./gmod-addon-prep.exe
```

This should make an extracted folder in which addons (CLIENT AND SERVER), addons-server (ONLY SERVER) and maps are upload ready for the server.
The maps are split in combined, which is for the game server upload, and compressed, which is for the fast download web server with compressed files.

If you want to see all other commands/arguments you can use just do:

```bash
./gmod-addon-prep.exe -h

or

./gmod-addon-prep.exe --help
```
