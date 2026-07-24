# Modown

A terminal-styled interface for bulk-downloading mods, resourcepacks, shaders,
datapacks, plugins, and modpacks from [Modrinth](https://modrinth.com).

Real API calls, real files — no mockups.

## Getting Started
>$ npm install\
>$ npm run dev

## Tabs

- `home` - Landing page and quick overview
- `collection` - Download every project in one or more Modrinth collections
- `modpack` - Download a single modpack at an exact version
- `help` - Full command reference and usage details

## Collection

- Enter one or more collection IDs or URLs (comma-separated), a mod version,
a pack version, and a loader.

- **Mod version** applies to loader-bound projects (e.g. `1.21.9`)
- **Pack version** applies to resourcepacks/shaders/datapacks/plugins, and
  accepts `latest` to grab the newest release regardless of Minecraft version
- **Loader** is selected from a dropdown (`fabric`, `forge`, `neoforge`, `quilt`)

Required dependencies are resolved and pulled in automatically. Output is
zipped as:
collections_{timestamp}/
├── mods/
├── resourcepacks/
├── shaders/
├── datapacks/
└── plugins/

## Modpack

Enter the exact version URL of a modpack, e.g.:
`https://modrinth.com/modpack/fabulously-optimized/version/14.0.0-beta.2`

The `.mrpack` file is downloaded and unpacked, every file in its manifest is
resolved and fetched, and `overrides/`/`client-overrides/` are merged into
the pack root. 

Output is zipped as:
> modpack_{slug}{version}{timestamp}/\
> ├── mods/, config/, ... (as defined by the pack manifest)\
> └── overrides merged into pack root\
## Notes

- Up to 5 downloads run concurrently per batch
- Failed downloads are logged individually and listed in the run summary
- A zip is only produced if at least one file downloaded successfully
