// Adds 3x3 mechanical crafting recipes for the Create Additions alternator and electric motor,
// so both can be automated with a single factory gauge, a single packager and a plain 3x3
// crafter square.
//
// This is NOT an upstream bug -- the recipes createaddition ships parse fine and craft fine by
// hand. It is a deliberate convenience change, which is why it lives here and not in
// upstream_recipe_fixes.js (that file is scoped to recipes that fail to load at all).
//
// ── The mechanic being worked around ──────────────────────────────────────────
// When a Packager is attached to a Mechanical Crafter, Create routes the unpack through
// CrafterUnpackingHandler.unpack(). Decompiled from create-1.21.1-6.0.10.jar:
//
//     int size = Math.min(inventories.size(), craftingInfo.size());
//     for (int i = 0; i < size; i++) {
//         BigItemStack target = craftingInfo.get(i);
//         if (target.stack.isEmpty()) continue;          // skips this inventory index too
//         inventories.get(i).insertItem(0, one, simulate);
//     }
//     for (ItemStack s : contents)
//         if (!s.isEmpty()) return false;                // refuses the package
//
// `inventories` is the wrench-linked connected input, sorted by
// ConnectedInput.getInventories() Y-descending then left-to-right as seen from the crafter
// faces -- i.e. grid reading order. `craftingInfo` is the package's crafting arrangement,
// authored by a factory gauge. The two are matched positionally by index, and if any item
// cannot be placed the whole package is refused. A refused package is silent: the funnel
// feeding the packager simply does nothing, with no log line and no error.
//
// Stock Create builds that arrangement as a fixed 3x3, so a recipe with more than 9 filled
// slots can never be delivered. The alternator is 5x5 with 13 filled slots, the electric
// motor 5x4 with 12.
//
// ── Important: the 3x3 is a default, not a limit ──────────────────────────────
// This pack ships extra_gauges 2.1.2, which mixins FactoryPanelBehaviour and
// FactoryPanelScreen to make the arrangement width adjustable -- see its Extend width /
// Reduce width buttons, and its own lang string "mechanical crafters (%s blocks wide)".
// So the upstream 5x5 and 5x4 recipes CAN be automated as they are, by setting the gauge
// width to 5 and building a full rectangle of crafters with Slot Covers on the cells the
// pattern leaves empty (25 crafters for the alternator, 20 for the motor). Covered crafters
// keep their index in the input group, and the arrangement's empty cells skip past them, so
// the positional mapping still lines up.
//
// That route was offered and not taken: it needs a 25-block crafter wall per machine and
// leaves correctness depending on a per-panel width setting. The 3x3 recipes below need nine
// crafters, one gauge, one packager, and no width fiddling at all.
//
// ── Gotcha worth knowing ──────────────────────────────────────────────────────
// extra_gauges stores the width per panel as NBT key `extra_gauges$CraftWidth`, defaulting to
// 3 when absent. It is NOT reset when the recipe changes. A gauge that was previously widened
// keeps its old width, lays the arrangement into a grid of that width, and the indices stop
// lining up with the crafter array -- which presents exactly like the failure above: silent
// refusal, plus "Recipe too big to render" in the gauge GUI. If these recipes ever stop
// working, check the gauge width before anything else. Re-placing the gauge resets it to 3.
//
// ── Cost ──────────────────────────────────────────────────────────────────────
// Nine slots cannot hold twelve or thirteen items. Both recipes keep all their ingredients
// and the full count of every expensive one, and take the loss entirely on the cheap bulk
// plate:
//
//     alternator      iron plates  6 -> 2   (4 iron ingots cheaper)
//     electric motor  brass plates 6 -> 3   (3 brass ingots cheaper)
//
// Spools, andesite alloy, iron rods and the capacitor are all unchanged from upstream.
//
// The 5x5 and 5x4 recipes are deliberately left registered -- they still work in their
// original crafter arrays and still show in JEI, so nothing already built or memorised
// changes. Hence kubejs: ids rather than createaddition's own: the house rule about reusing
// the mod's recipe id is for *overwriting* a broken upstream file, and reusing it here would
// delete the originals instead of adding to them.
//
// These need a 3x3 crafter array; the diamonds the upstream patterns call for will not match.

ServerEvents.recipes(event => {
    if (!Platform.isLoaded('createaddition')) return

    // Mirrors data/createaddition/recipe/mechanical_crafting/alternator.json, with the
    // 5x5 diamond collapsed to 3x3: spools to the corners, alloy flanking, rod still centre.
    //
    //      A            S I S
    //     I S I         A R A
    //    I S R S I  ->  S I S
    //     I S I
    //      A
    event.custom({
        type: 'create:mechanical_crafting',
        accept_mirrored: true,
        category: 'misc',
        key: {
            A: { item: 'create:andesite_alloy' },
            I: { tag: 'c:plates/iron' },
            R: { tag: 'c:rods/iron' },
            S: { item: 'createaddition:copper_spool' }
        },
        pattern: [
            'SIS',
            'ARA',
            'SIS'
        ],
        result: { count: 1, id: 'createaddition:alternator' }
    }).id('kubejs:createaddition/alternator_3x3')

    // Mirrors data/createaddition/recipe/mechanical_crafting/electric_motor.json.
    //
    //      A            S A B
    //     B S B         S R B
    //    B S R S B  ->  S C B
    //     B C B
    //
    // The centre column keeps upstream's A / R / C spine in order; the coil stack goes down
    // one side and the brass casing down the other. This layout is deliberately not
    // left-right symmetric, and cannot be: a mirrored 3x3 has only three spine slots that can
    // carry an odd count, and this ingredient set has five odd counts (A1 B3 S3 R1 C1).
    // accept_mirrored still lets the flipped build work.
    event.custom({
        type: 'create:mechanical_crafting',
        accept_mirrored: true,
        category: 'misc',
        key: {
            A: { item: 'create:andesite_alloy' },
            B: { tag: 'c:plates/brass' },
            C: { item: 'createaddition:capacitor' },
            R: { tag: 'c:rods/iron' },
            S: { item: 'createaddition:copper_spool' }
        },
        pattern: [
            'SAB',
            'SRB',
            'SCB'
        ],
        result: { count: 1, id: 'createaddition:electric_motor' }
    }).id('kubejs:createaddition/electric_motor_3x3')
})
