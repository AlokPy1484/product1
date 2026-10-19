import {
    DEFAULT_PATTERN_CONFIG,
    type LayerStack,
    type PatternConfig,
    type PatternLayer,
} from "@/app/types/grid-config"
import { getLabelContrast } from "./color-contrast"

export const MAX_LAYERS = 50
export function validPatternConfig(value: unknown): value is PatternConfig {
    if (!value || typeof value !== "object" || Array.isArray(value))
        return false
    const c = value as PatternConfig
    return (
        ["dots", "striped", "grid"].includes(c.pattern) &&
        [c.primaryColour, c.backgroundColour].every(
            (v) => typeof v === "string" && /^#[\da-f]{6}$/i.test(v),
        ) &&
        Object.entries({
            scale: [0.1, 3],
            spacing: [10, 100],
            opacity: [0.1, 1],
            primaryRotation: [0, 180],
            secondaryRotation: [0, 180],
        }).every(([key, [min, max]]) => {
            const v = c[key as keyof PatternConfig]
            return (
                typeof v === "number" &&
                Number.isFinite(v) &&
                v >= min &&
                v <= max
            )
        })
    )
}
export function emptyStack(): LayerStack {
    return { layers: [], expandedLayerId: null, nextLayerNumber: 1 }
}
export function createStack(
    config: PatternConfig = DEFAULT_PATTERN_CONFIG,
): LayerStack {
    return {
        layers: [
            {
                id: "layer-1",
                name: "Layer 1",
                config: { ...config },
                backgroundEnabled: true,
            },
        ],
        expandedLayerId: "layer-1",
        nextLayerNumber: 2,
    }
}
export function normalizeStack(value: unknown): LayerStack | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null
    const v = value as LayerStack
    if (!Array.isArray(v.layers) || v.layers.length > MAX_LAYERS) return null
    const ids = new Set<string>()
    const layers: PatternLayer[] = []
    for (const layer of v.layers) {
        if (
            !layer ||
            typeof layer !== "object" ||
            typeof layer.id !== "string" ||
            !/^[\w-]{1,80}$/.test(layer.id) ||
            ids.has(layer.id) ||
            !validPatternConfig(layer.config) ||
            typeof layer.backgroundEnabled !== "boolean"
        )
            return null
        ids.add(layer.id)
        layers.push({
            id: layer.id,
            name:
                typeof layer.name === "string"
                    ? layer.name.slice(0, 64)
                    : "Untitled layer",
            config: { ...layer.config },
            backgroundEnabled: layer.backgroundEnabled,
        })
    }
    const maxName = Math.max(
        0,
        ...layers.map((l) => {
            const number = Number(l.name.match(/^Layer (\d+)$/)?.[1])
            return Number.isSafeInteger(number) && number > 0 && number < 1e9
                ? number
                : 0
        }),
    )
    return {
        layers,
        expandedLayerId:
            typeof v.expandedLayerId === "string" && ids.has(v.expandedLayerId)
                ? v.expandedLayerId
                : null,
        nextLayerNumber: Math.max(
            maxName + 1,
            layers.length + 1,
            Number.isSafeInteger(v.nextLayerNumber) &&
                v.nextLayerNumber > 0 &&
                v.nextLayerNumber < 1e9
                ? v.nextLayerNumber
                : 1,
        ),
    }
}
export function visibleBackground(
    stack: LayerStack,
    fallback = "#ffffff",
): string {
    return (
        stack.layers.find((l) => l.backgroundEnabled)?.config
            .backgroundColour ?? fallback
    )
}
export type StackAction =
    | { type: "add"; id: string; initial?: PatternConfig }
    | { type: "toggle"; id: string }
    | {
          type: "edit"
          id: string
          config?: Partial<PatternConfig>
          name?: string
          backgroundEnabled?: boolean
      }
    | { type: "reset-layer"; id: string }
    | { type: "remove"; id: string }
    | { type: "reorder"; ids: string[] }
    | { type: "move"; id: string; direction: -1 | 1 }
export function updateStack(
    stack: LayerStack,
    action: StackAction,
): LayerStack {
    switch (action.type) {
        case "add": {
            if (
                stack.layers.length >= MAX_LAYERS ||
                stack.layers.some((l) => l.id === action.id)
            )
                return stack
            const first = !stack.layers.length
            const config =
                first && action.initial
                    ? { ...action.initial }
                    : {
                          ...DEFAULT_PATTERN_CONFIG,
                          primaryColour: getLabelContrast(
                              visibleBackground(stack),
                          ).color,
                      }
            const layer: PatternLayer = {
                id: action.id,
                name: `Layer ${stack.nextLayerNumber}`,
                backgroundEnabled: first,
                config,
            }
            return {
                layers: [layer, ...stack.layers],
                expandedLayerId: layer.id,
                nextLayerNumber: stack.nextLayerNumber + 1,
            }
        }
        case "toggle":
            return stack.layers.some((l) => l.id === action.id)
                ? {
                      ...stack,
                      expandedLayerId:
                          stack.expandedLayerId === action.id
                              ? null
                              : action.id,
                  }
                : stack
        case "edit":
            return {
                ...stack,
                layers: stack.layers.map((l) =>
                    l.id === action.id
                        ? {
                              ...l,
                              ...(action.name !== undefined
                                  ? { name: action.name.slice(0, 64) }
                                  : {}),
                              ...(action.backgroundEnabled !== undefined
                                  ? {
                                        backgroundEnabled:
                                            action.backgroundEnabled,
                                    }
                                  : {}),
                              config: action.config
                                  ? { ...l.config, ...action.config }
                                  : l.config,
                          }
                        : l,
                ),
            }
        case "reset-layer":
            return {
                ...stack,
                layers: stack.layers.map((l) =>
                    l.id === action.id
                        ? {
                              ...l,
                              config: {
                                  ...DEFAULT_PATTERN_CONFIG,
                                  primaryColour: l.backgroundEnabled
                                      ? DEFAULT_PATTERN_CONFIG.primaryColour
                                      : getLabelContrast(
                                            visibleBackground(stack),
                                        ).color,
                              },
                          }
                        : l,
                ),
            }
        case "remove": {
            const index = stack.layers.findIndex((l) => l.id === action.id)
            if (index < 0) return stack
            const layers = stack.layers.filter((l) => l.id !== action.id)
            return {
                ...stack,
                layers,
                expandedLayerId:
                    stack.expandedLayerId === action.id
                        ? (layers[Math.min(index, layers.length - 1)]?.id ??
                          null)
                        : stack.expandedLayerId,
            }
        }
        case "reorder": {
            if (
                action.ids.length !== stack.layers.length ||
                new Set(action.ids).size !== stack.layers.length ||
                action.ids.some((id) => !stack.layers.some((l) => l.id === id))
            )
                return stack
            return {
                ...stack,
                layers: action.ids.map(
                    (id) => stack.layers.find((l) => l.id === id)!,
                ),
            }
        }
        case "move": {
            const index = stack.layers.findIndex((l) => l.id === action.id),
                next = index + action.direction
            if (index < 0 || next < 0 || next >= stack.layers.length)
                return stack
            const layers = [...stack.layers]
            ;[layers[index], layers[next]] = [layers[next], layers[index]]
            return { ...stack, layers }
        }
    }
}
