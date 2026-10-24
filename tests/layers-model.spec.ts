import { test, expect } from "@playwright/test"
import { DEFAULT_PATTERN_CONFIG } from "../app/types/grid-config"
import {
    createStack,
    emptyStack,
    normalizeStack,
    updateStack,
    visibleBackground,
} from "../lib/pattern-layers"
import { getLayerStackCSS } from "../app/utils.ts/pattern-utils"
import { normalizeProject } from "../lib/html-preview/types"

test("new layers are transparent and preserve the opaque original", () => {
    const original = createStack({
        ...DEFAULT_PATTERN_CONFIG,
        backgroundColour: "#000000",
    })
    const next = updateStack(original, { type: "add", id: "new" })
    expect(next.layers.map((l) => l.name)).toEqual(["Layer 2", "Layer 1"])
    expect(next.layers[0].backgroundEnabled).toBe(false)
    expect(next.layers[0].config.primaryColour).toBe("#ffffff")
    expect(next.layers[1]).toEqual(original.layers[0])
    expect(visibleBackground(next)).toBe("#000000")
})
test("collapse does not change output and resetting one layer leaves others alone", () => {
    const original = updateStack(createStack(), { type: "add", id: "new" })
    const edited = updateStack(original, {
        type: "edit",
        id: "new",
        config: { spacing: 50 },
        name: "Texture",
    })
    const collapsed = updateStack(edited, { type: "toggle", id: "new" })
    expect(getLayerStackCSS(collapsed)).toEqual(getLayerStackCSS(edited))
    expect(collapsed.expandedLayerId).toBeNull()
    const reset = updateStack(edited, { type: "reset-layer", id: "new" })
    expect(reset.layers[0].name).toBe("Texture")
    expect(reset.layers[0].config.spacing).toBe(10)
    expect(reset.layers[0].backgroundEnabled).toBe(false)
    expect(reset.layers[1]).toEqual(original.layers[1])
})
test("reorder keeps identity, config and selection, and rejects invalid permutations", () => {
    const stack = updateStack(createStack(), { type: "add", id: "new" })
    const reordered = updateStack(stack, {
        type: "reorder",
        ids: ["layer-1", "new"],
    })
    expect(reordered.layers[1]).toEqual(stack.layers[0])
    expect(reordered.expandedLayerId).toBe("new")
    expect(updateStack(stack, { type: "reorder", ids: ["new", "new"] })).toBe(
        stack,
    )
    expect(updateStack(stack, { type: "move", id: "new", direction: -1 })).toBe(
        stack,
    )
})
test("removal selects a neighboring layer and supports a saved empty stack", () => {
    let stack = updateStack(createStack(), { type: "add", id: "new" })
    stack = updateStack(stack, { type: "remove", id: "new" })
    expect(stack.expandedLayerId).toBe("layer-1")
    stack = updateStack(stack, { type: "remove", id: "layer-1" })
    expect(normalizeStack(JSON.parse(JSON.stringify(stack)))).toEqual(stack)
    expect(getLayerStackCSS(stack).backgroundImage).toBe("none")
})
test("grid flattening pairs every image with its size and preserves solid backgrounds", () => {
    let stack = createStack({
        ...DEFAULT_PATTERN_CONFIG,
        pattern: "grid",
        primaryColour: "#123456",
    })
    stack = updateStack(stack, { type: "add", id: "dots" })
    const css = getLayerStackCSS(stack)
    expect(css.backgroundSize).toBe("10px 10px, auto, auto, auto")
    expect(css.backgroundImage.indexOf("radial-gradient")).toBeLessThan(
        css.backgroundImage.indexOf("repeating-linear-gradient"),
    )
    expect(css.backgroundImage).toContain("linear-gradient(#ffffff, #ffffff)")
})
test("invalid saved layers are rejected and naming counters never collide with existing names", () => {
    const stack = createStack()
    expect(
        normalizeStack({
            ...stack,
            layers: [stack.layers[0], stack.layers[0]],
        }),
    ).toBeNull()
    expect(
        normalizeStack({
            ...stack,
            layers: [
                {
                    ...stack.layers[0],
                    config: { ...DEFAULT_PATTERN_CONFIG, opacity: Infinity },
                },
            ],
        }),
    ).toBeNull()
    expect(
        normalizeStack({ ...stack, nextLayerNumber: 1 })!.nextLayerNumber,
    ).toBe(2)
    expect(
        normalizeStack({
            ...stack,
            layers: [
                {
                    ...stack.layers[0],
                    name: "Layer 99999999999999999999999999999999999999999",
                },
            ],
        })!.nextLayerNumber,
    ).toBe(2)
    expect(
        updateStack(emptyStack(), { type: "add", id: "fresh" }).layers[0]
            .backgroundEnabled,
    ).toBe(true)
})
test("version 1 component projects migrate each target independently without changing source", () => {
    const legacy = {
        version: 1,
        id: "project",
        name: "saved.html",
        html: "<section>Original</section>",
        css: "section { padding: 20px }",
        allowRemoteAssets: false,
        backgrounds: {
            "target-1": { ...DEFAULT_PATTERN_CONFIG, spacing: 30 },
            "target-2": { ...DEFAULT_PATTERN_CONFIG, pattern: "grid" },
        },
        selectedId: "target-2",
    }
    const migrated = normalizeProject(legacy)!
    expect(migrated.version).toBe(2)
    expect(migrated.html).toBe(legacy.html)
    expect(migrated.css).toBe(legacy.css)
    expect(migrated.backgrounds["target-1"].layers[0].config.spacing).toBe(30)
    expect(migrated.backgrounds["target-2"].layers[0].config.pattern).toBe(
        "grid",
    )
    expect(normalizeProject(migrated)).toEqual(migrated)
})
