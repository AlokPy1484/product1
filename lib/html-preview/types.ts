import { createStack, normalizeStack, validPatternConfig } from "@/lib/pattern-layers"
import type { LayerStack } from "@/app/types/grid-config"

export const MAX_SOURCE_BYTES = 2 * 1024 * 1024
export const TARGET_ATTRIBUTE = "data-dotgrid-target"
export interface ComponentProject {
    version: 2
    id: string
    name: string
    html: string
    css: string
    allowRemoteAssets: boolean
    backgrounds: Record<string, LayerStack>
    selectedId: string | null
}
export interface PreviewTarget {
    id: string
    label: string
    parentId: string | null
    width: number
    height: number
    background: string
    inlineImportant: boolean
}
export function normalizeProject(value: unknown): ComponentProject | null {
    if (!value || typeof value !== "object") return null
    const p = value as ComponentProject
    if (!([1, 2] as number[]).includes(p.version) || typeof p.id !== "string" || !/^[\w-]{1,80}$/.test(p.id) || typeof p.name !== "string" || typeof p.html !== "string" || !p.html.trim() || typeof p.css !== "string" || new Blob([p.html, p.css]).size > MAX_SOURCE_BYTES) return null
    const backgrounds: Record<string, LayerStack> = {}
    if (p.backgrounds && typeof p.backgrounds === "object") for (const [id, config] of Object.entries(p.backgrounds).slice(0, 1000)) {
        if (!/^target-\d+$/.test(id)) continue
        const stack = normalizeStack(config) ?? (validPatternConfig(config) ? createStack(config) : null)
        if (stack?.layers.length) backgrounds[id] = stack
    }
    return { version: 2, id: p.id, name: p.name.slice(0, 120), html: p.html, css: p.css, allowRemoteAssets: p.allowRemoteAssets === true, backgrounds, selectedId: typeof p.selectedId === "string" && /^target-\d+$/.test(p.selectedId) ? p.selectedId : null }
}
