# gonk server pack

The released Minecraft modpack behind **The Factory Must Gonk** — a NeoForge 1.21.1
Create-and-settlements server pack.

| | |
|---|---|
| Minecraft | 1.21.1 |
| Mod loader | NeoForge 21.1.243 |
| Launcher | PrismLauncher (`OneSix` instance) |
| Mods | 108 |
| Recommended RAM | 6096 MB |

The current commit on `main` is **Server Pack 3**. Pack 4 is being built in a separate
local dev instance and is not in this repo yet.

## What is and isn't in here

This repo tracks the **pack**, not a playable install. Committed:

- `mmc-pack.json`, `instance.cfg` — Minecraft and NeoForge versions, memory, icon
- `minecraft/config/`, `minecraft/defaultconfigs/` — every mod's configuration
- `minecraft/kubejs/`, `minecraft/local/kubejs/` — KubeJS scripts and data
- `minecraft/moonlight-global-datapacks/` — the Apokinetics fixes datapack
- `minecraft/schematics/`, `minecraft/resourcepacks/`, `minecraft/options.txt`
- `minecraft/mods/.index/` — packwiz metadata for all 99 Prism-installed mods
- nine loose jars in `minecraft/mods/` (see below)

Not committed: worlds (`saves/`, 3.4 GB), the Distant Horizons LOD database (1.25 GB),
logs, crash reports, screenshots, Xaero map data, per-player caches, `servers.dat`
(it holds the live server address), and `kubejs/config/web_server.json` (it holds a
generated auth token — KubeJS regenerates it on first run).

## The mod jars

99 of the 108 mods were installed through Prism, so `minecraft/mods/.index/*.pw.toml`
records each one's project ID, exact version, download URL and sha512. Those jars are
**not** committed — they are reproducible from the index and mostly aren't licensed for
redistribution anyway.

Nine jars were installed by hand and have no index entry, so they are committed:

| Jar | Origin |
|---|---|
| `thee-1.0.0.jar` | **custom** — settlements/economy mod, source at `thee-template-1.21.1` |
| `chaosgate-1.0.0.jar` | **custom** — enemy spawn tweaks |
| `omnifix-1.0.0.jar` | **custom** — compatibility patches |
| `akschematics-1.0.0.jar` | **custom** |
| `ProbeJS-8.0.3.jar` | third-party, hand-installed |
| `kubejs-neoforge-2101.7.2-build.368.jar` | third-party, hand-installed |
| `kubejs-create-neoforge-2101.3.1-build.18.jar` | third-party, hand-installed |
| `lootjs-neoforge-1.21.1-3.7.0.jar` | third-party, hand-installed |
| `morejs-neoforge-1.21.1-0.16.0.jar` | third-party, hand-installed |

If a new jar is added by hand, add it to the allowlist at the bottom of `.gitignore`
or it will be silently ignored.

## Assembling a playable instance

1. Clone into your PrismLauncher `instances/` folder, or clone anywhere and point Prism at it.
2. Fetch the indexed mods. With [packwiz](https://packwiz.infra.link/) installed:
   ```
   cd minecraft/mods/.index
   packwiz install --all
   ```
   Or let Prism re-download them from the instance's mod list.
3. Launch once so KubeJS regenerates `kubejs/config/web_server.json`.
4. Add the server address to your multiplayer list by hand — it isn't in the repo.

## Releasing

Full instance exports (including worlds) are cut as zips outside this repo. Tag a commit
when a pack ships:

```
git tag -a pack-3 -m "Server Pack 3"
```
