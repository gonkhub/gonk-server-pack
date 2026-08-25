# gonk server pack

The released Minecraft modpack behind **The Factory Must Gonk** — a NeoForge 1.21.1
Create-and-settlements server pack.

| | |
|---|---|
| Minecraft | 1.21.1 |
| Mod loader | NeoForge 21.1.243 |
| Launcher | PrismLauncher (`OneSix` instance) |
| Mods | 107 |
| Recommended RAM | 6096 MB (fixed heap, see below) |

The current commit on `main` is **Server Pack 4**.

## What is and isn't in here

This repo tracks the **pack**, not a playable install. Committed:

- `mmc-pack.json`, `instance.cfg` — Minecraft and NeoForge versions, memory, icon
- `minecraft/config/`, `minecraft/defaultconfigs/` — every mod's configuration
- `minecraft/kubejs/`, `minecraft/local/kubejs/` — KubeJS scripts and data
- `minecraft/moonlight-global-datapacks/` — the pack's own fix datapacks (see Known issues)
- `minecraft/schematics/`, `minecraft/resourcepacks/`, `minecraft/options.txt`
- `minecraft/mods/.index/` — packwiz metadata for all 99 Prism-installed mods
- eight loose jars in `minecraft/mods/` (see below)
- `scripts/` — the `instance.cfg` clean filter (see Committing)

Not committed: worlds (`saves/`, 3.4 GB), the Distant Horizons LOD database (1.25 GB),
logs, crash reports, screenshots, Xaero map data, per-player caches, `servers.dat`
(it holds the live server address), and `kubejs/config/web_server.json` (it holds a
generated auth token — KubeJS regenerates it on first run).

## The mod jars

99 of the 107 mods were installed through Prism, so `minecraft/mods/.index/*.pw.toml`
records each one's project ID, exact version, download URL and sha512. Those jars are
**not** committed — they are reproducible from the index and mostly aren't licensed for
redistribution anyway.

Eight jars were installed by hand and have no index entry, so they are committed:

| Jar | Origin |
|---|---|
| `thee-1.0.0.jar` | **custom** — settlements/economy mod, source at `thee-template-1.21.1` |
| `chaosgate-1.0.0.jar` | **custom** — enemy spawn tweaks |
| `omnifix-1.1.0.jar` | **custom** — compatibility patches, source at `Desktop/omnifix` |
| `akschematics-1.1.0.jar` | **custom** — Schematicannon charges for socketed gems, source at `Desktop/akschematics` |
| `kubejs-neoforge-2101.7.2-build.368.jar` | third-party, hand-installed |
| `kubejs-create-neoforge-2101.3.1-build.18.jar` | third-party, hand-installed |
| `lootjs-neoforge-1.21.1-3.7.0.jar` | third-party, hand-installed |
| `morejs-neoforge-1.21.1-0.16.0.jar` | third-party, hand-installed |

The allowlist at the bottom of `.gitignore` matches these by **name glob**, not by exact
filename — `!/minecraft/mods/thee-*.jar`, not `!/minecraft/mods/thee-1.0.0.jar`. Bumping a
custom mod's version no longer silently drops it from the repo. A genuinely new hand-installed
mod still needs its own line.

ProbeJS was removed in Pack 4. It is a developer type-dumper for writing KubeJS scripts with
IDE autocomplete; it has no player-facing effect and belongs in the dev instance, not in a
pack every player downloads.

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

## Client settings that matter

**Render distance is 8 on purpose.** Distant Horizons is configured with
`lodChunkRenderDistanceRadius = 256`, so the horizon is DH's job. Every chunk inside the vanilla
render distance is meshed *and* held as an LOD, so a high vanilla distance pays for the same
terrain twice and buys nothing you can see. Pack 3 shipped at 17. If you raise it, raise it
knowing that is what you are buying.

**The heap is fixed at 6096 MB.** `MinMemAlloc` equals `MaxMemAlloc` so the JVM never spends the
first session growing the heap, and `instance.cfg` sets G1 flags (Aikar's set, tuned for a heap
under 12 GB) instead of running G1 stock under 107 mods. If you change `MaxMemAlloc`, change
`MinMemAlloc` with it.

## Mod version policy

The packwiz index records a release type per mod. As of Pack 4: 86 release, 12 beta, 1 alpha.

Most of those betas are how the author publishes — JEI, Biomes O' Plenty, TerraBlender,
GlitchCore and wthit ship every build as beta and are not unstable in any meaningful sense.
Filtering on the label alone is not useful.

The rule that is worth keeping is narrower:

> **No alpha jars in a release.** Betas are fine when the mod's author uses beta as their normal
> release channel. Betas that are genuinely pre-release — Distant Horizons, Iris, Steam 'n'
> Rails, DnDesires — are acceptable but are the first place to look when something breaks.

The one alpha is `create-enchantment-industry-2.5.0-preview-alpha1`, and it is load-bearing: the
Gem Cutter, Blaze Composer and Affix Augmentor economy all come from 2.5.0, and
`config/create_enchantment_industry-apotheosis-server.toml` is entirely 2.5.0 settings. Pinning
back to a stable CEI would delete that content and the balance work on top of it. It stays, and
`omnifix` contains the guard that stops its broken Ponder scene from being fatal (see below).

## Known issues

**Create: Enchantment Industry's Apotheosis ponder scene throws.** CEI 2.5.0-preview-alpha1's
`CEIAXPonderScenes.bulkSalvaging` reads `Apoth$Items.RARE_MATERIAL`, which Apotheosis removed in
8.6.0. Because Ponder compiles scenes from the item-tooltip event, this used to crash the client
on *hovering an item in JEI* — see `crash-2026-07-31_02.42.30` and `crash-2026-08-21_21.03.26`,
the same stack trace three weeks apart.

`omnifix` now wraps the storyboard call in a `try`/`catch`, so a throwing scene renders truncated
and logs once instead of taking the game down. Confirmed working: the guard fires once per session
on the Bulk Salvaging scene and no crash report has been written since it shipped. Watch for
`Ponder storyboard ... threw while building its scene` in the log — if it names something other
than CEI, a second addon has gone stale.

That is a containment, not a cure. The cure exists upstream now: **CEI 2.5.3** (2026-08-22) is
titled "for Create 1.21.1-6.0.10", which is the Create version this pack runs, and its changelog
reads *"Fixed a crash when using Apotheosis 8.7 or newer… The Apotheosis integration now works
independently, including its machines, affix templates, essences, Bulk Salvaging, and Ponder
scenes."* Taking it means moving Apotheosis 8.6.0 → 8.7.0 and Apothic Enchanting 1.6.0 → 1.6.1 in
the same step; CEI 2.5.1's stated target set is Placebo 9.9.2, Apothic Attributes 2.10.1, Apothic
Enchanting 1.6.0, Apothic Spawners 1.4.0 and Apotheosis 8.7.0, and this pack already matches every
one of those except Apotheosis. It was not taken for Pack 4 because swapping Apotheosis on a live
world touches every affixed item players are carrying.

**Five recipes ship broken and are patched here.** Astrological 1.7.0 and Create Deco 2.1.3 both
ship recipe JSON in the 1.21.2+ ingredient format (`{"id": ...}`) on a 1.21.1 build, so vanilla's
`RecipeManager` throws a `JsonParseException` and drops them. `astrological:popped_purpurite` and
`astrological:cracked_light_jade_tiles` have no other recipe at all, so both blocks were in the
registry with nothing in the game producing them; `createdeco:placard` is the white entry of the
dye_placard group, the one placard colour you could not mix back to.
`kubejs/server_scripts/upstream_recipe_fixes.js` re-registers all five under the mods' own recipe
ids, so a corrected upstream file would overwrite cleanly rather than leaving duplicates in JEI.

**Red's More Structures' tower chest generated empty.** Its `minecraft:chests/tower2` loot table
uses `set_nbt`, which 1.21 replaced with `set_components`, so the entire table failed to parse and
the chest rolled nothing. `moonlight-global-datapacks/reds-more-structures-fixes/` is the same
table with that one function ported to `minecraft:potion_contents`.

## Releasing

Full instance exports (including worlds) are cut as zips outside this repo, via Prism's
**Export Instance**. `.packignore` controls what the zip leaves out — logs, crash reports,
`servers.dat_old`, the Xaero waypoint backup, and the `.vscode` / `.probe` / `.sable` dev
folders are all excluded. `servers.dat` itself *is* shipped, so the server is pre-added for
players; the world and the Distant Horizons LOD database ship too, which is most of the
zip's size.

### Committing

`instance.cfg` is filtered on the way into git by `scripts/clean-instance-cfg.sh`, wired up in
`.gitattributes`. Prism rewrites `lastLaunchTime`, `lastTimePlayed`, `totalTimePlayed` and the
`[UI]` column widths on every launch, and it stores this machine's Java install as absolute paths
under `C:/Users/<name>/`. The filter drops both groups and flips `OverrideJavaLocation` to `false`
in the committed copy, so a cloned instance lets Prism pick its own runtime instead of starting on
a `JavaPath` that does not exist. The working copy is never touched.

Git needs the filter configured once per clone — without it the file is committed verbatim, which
is safe but brings the noise back:

```
git config filter.prism-instance-cfg.clean "sh ./scripts/clean-instance-cfg.sh"
git config filter.prism-instance-cfg.smudge cat
```

### Tagging

Tag a commit when a pack ships, and push the tag — a tag that only exists locally is not a
release marker:

```
git tag -a pack-4 -m "Server Pack 4"
git push origin pack-4
```

Check what is already marked with `git ls-remote --tags origin`. `pack-3` is tagged and pushed at
`13e3354`; `pack-4` is tagged locally and still needs pushing.
