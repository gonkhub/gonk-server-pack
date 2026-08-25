// Re-registers recipes that ship broken and fail to parse on every load.
//
// All of these are the same upstream mistake: the mod was authored against 1.21.2+, where a
// recipe ingredient is an object with an `id` key, and shipped for 1.21.1, where the codec
// still wants `item` (or a bare string) and a cooking result must be an item stack object
// rather than a bare id. Vanilla's RecipeManager logs a JsonParseException and drops the
// recipe, so the affected items simply have no recipe at all.
//
// Each fix keeps the mod's own recipe id, so if the mod later ships a corrected file this
// script overwrites it with an identical recipe instead of leaving a duplicate in JEI.
//
// Verified against the failures in logs/latest.log on 2026-08-25. Re-check this file whenever
// astrological or createdeco is updated -- when the upstream recipes parse again these become
// no-ops and can be deleted.

ServerEvents.recipes(event => {
    // ── Astrological 1.7.0 ────────────────────────────────────────────────────
    // popped_purpurite and cracked_light_jade_tiles are *only* obtainable by smelting.
    // With all four recipes dropped, both blocks exist in the registry but nothing in the
    // game produces them. Values below are copied from the mod's own JSON.
    if (Platform.isLoaded('astrological')) {
        event.smelting('astrological:popped_purpurite', 'astrological:purpurite_blob')
            .cookingTime(200).xp(0.9)
            .id('astrological:purpurite_tiles/popped_purpurite')

        event.blasting('astrological:popped_purpurite', 'astrological:purpurite_blob')
            .cookingTime(100).xp(0.9)
            .id('astrological:purpurite_tiles/popped_purpurite_blasting')

        event.smelting('astrological:cracked_light_jade_tiles', 'astrological:light_jade_tiles')
            .cookingTime(200).xp(0.9)
            .id('astrological:cracked_light_jade_tiles/cracked_light_jade_tiles')

        event.blasting('astrological:cracked_light_jade_tiles', 'astrological:light_jade_tiles')
            .cookingTime(100).xp(0.9)
            .id('astrological:cracked_light_jade_tiles/cracked_light_jade_tiles_blasting')
    }

    // ── Create Deco 2.1.3 ─────────────────────────────────────────────────────
    // Only the white entry of the dye_placard group is broken; the other fifteen colours
    // parse fine, so this is the one placard colour you cannot currently mix back to.
    if (Platform.isLoaded('createdeco')) {
        event.shapeless('create:placard', ['#createdeco:placards', 'minecraft:white_dye'])
            .id('createdeco:placard')
    }
})
