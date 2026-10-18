import type { PatternConfig } from "@/app/types/grid-config"

export const MAX_SOURCE_BYTES = 2 * 1024 * 1024
export const TARGET_ATTRIBUTE = "data-dotgrid-target"
export interface ComponentProject {
    version: 1
    id: string
    name: string
    html: string
    css: string
    allowRemoteAssets: boolean
    backgrounds: Record<string, PatternConfig>
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
export function validPattern(value: unknown): value is PatternConfig {
    if (!value || typeof value !== "object") return false
    const c = value as PatternConfig
    return ["dots", "striped", "grid"].includes(c.pattern) &&
        [c.primaryColour, c.backgroundColour].every(v => typeof v === "string" && /^#[\da-f]{6}$/i.test(v)) &&
        Object.entries({ scale: [.1, 3], spacing: [10, 100], opacity: [.1, 1], primaryRotation: [0, 180], secondaryRotation: [0, 180] })
            .every(([key, [min, max]]) => typeof c[key as keyof PatternConfig] === "number" && Number.isFinite(c[key as keyof PatternConfig]) && Number(c[key as keyof PatternConfig]) >= min && Number(c[key as keyof PatternConfig]) <= max)
}
export function normalizeProject(value: unknown): ComponentProject | null {
    if (!value || typeof value !== "object") return null
    const p = value as ComponentProject
    if (p.version !== 1 || typeof p.id !== "string" || !/^[\w-]{1,80}$/.test(p.id) || typeof p.name !== "string" || typeof p.html !== "string" || !p.html.trim() || typeof p.css !== "string" || new Blob([p.html, p.css]).size > MAX_SOURCE_BYTES) return null
    const backgrounds: Record<string, PatternConfig> = {}
    if (p.backgrounds && typeof p.backgrounds === "object") for (const [id, config] of Object.entries(p.backgrounds).slice(0, 1000)) {
        if (/^target-\d+$/.test(id) && validPattern(config)) backgrounds[id] = config
    }
    return { version: 1, id: p.id, name: p.name.slice(0, 120), html: p.html, css: p.css, allowRemoteAssets: p.allowRemoteAssets === true, backgrounds, selectedId: typeof p.selectedId === "string" && /^target-\d+$/.test(p.selectedId) ? p.selectedId : null }
}
