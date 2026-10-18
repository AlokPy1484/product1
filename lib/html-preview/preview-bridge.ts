import type { PatternConfig } from "@/app/types/grid-config"

/** Serialized into the isolated document. Keep every runtime dependency inside this function. */
export function previewBridge(settings: { session: string; parentOrigin: string; projectId: string }, patternCSS: (config: PatternConfig) => Record<string, string>) {
    const attribute = "data-dotgrid-target"
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(`[${attribute}]`))
    const targets = new Map(nodes.map(node => [node.getAttribute(attribute)!, node]))
    const originals = new Map<string, string | null>()
    const displayed = new Map<string, PatternConfig>()
    const animations = new Map<string, number>()
    let port: MessagePort | null = null
    let selected: string | null = null
    let hovered: string | null = null
    let selecting = true
    let lastHover = 0
    let lastGeometry = ""
    const originalBackgrounds = new Map<string, string>()
    const properties = ["background-image", "background-color", "background-size", "background-repeat", "background-position"]
    const outline = document.createElement("div")
    const label = document.createElement("span")
    outline.setAttribute("data-dotgrid-tool", "")
    label.setAttribute("data-dotgrid-tool", "")
    function styles(element: HTMLElement, values: Record<string, string>) {
        for (const [key, value] of Object.entries(values)) element.style.setProperty(key, value, "important")
    }
    styles(outline, { position: "fixed", "pointer-events": "none", "z-index": "2147483647", border: "1.5px dashed #171717", "box-shadow": "0 0 0 1px #ffffff", display: "none", "box-sizing": "border-box" })
    styles(label, { position: "absolute", top: "0", left: "0", transform: "translateY(-100%)", background: "#171717", color: "#f5f5f5", padding: "4px 8px", "border-radius": "6px", font: "12px/16px system-ui,sans-serif", "white-space": "nowrap", "max-width": "90vw", overflow: "hidden", "text-overflow": "ellipsis" })
    outline.append(label)
    document.documentElement.append(outline)
    function name(node: HTMLElement) {
        const classes = Array.from(node.classList).filter(c => !c.startsWith("dotgrid-bg-")).slice(0, 2)
        return (node.tagName.toLowerCase() + (node.id ? `#${node.id}` : classes.length ? `.${classes.join(".")}` : "")).slice(0, 240)
    }
    function metadata(node: HTMLElement) {
        const parent = node.parentElement?.closest<HTMLElement>(`[${attribute}]`)
        const rect = node.getBoundingClientRect()
        return { id: node.getAttribute(attribute), label: name(node), parentId: parent?.getAttribute(attribute) ?? null, width: Math.round(rect.width), height: Math.round(rect.height), background: originalBackgrounds.get(node.getAttribute(attribute)!) || getComputedStyle(node).backgroundColor, inlineImportant: properties.some(p => node.style.getPropertyPriority(p) === "important") }
    }
    function send(message: Record<string, unknown>) { port?.postMessage(message) }
    function draw() {
        const id = hovered || selected
        const node = id ? targets.get(id) : null
        if (!node?.isConnected) { outline.style.setProperty("display", "none", "important"); return }
        const rect = node.getBoundingClientRect()
        styles(outline, { display: "block", left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` })
        if (id === selected) {
            const target = metadata(node)
            const key = `${id}:${target.width}:${target.height}`
            if (key !== lastGeometry) { lastGeometry = key; send({ type: "geometry", target }) }
        }
        label.textContent = name(node)
        label.style.setProperty("transform", rect.top < 28 ? "none" : "translateY(-100%)", "important")
    }
    function select(id: string | null) {
        if (id && !targets.has(id)) return
        selected = id
        hovered = null
        lastGeometry = ""
        draw()
        send({ type: "selected", target: id ? metadata(targets.get(id)!) : null })
    }
    function apply(node: HTMLElement, config: PatternConfig) {
        const values = patternCSS(config)
        for (const [key, value] of Object.entries(values)) node.style.setProperty(key.replace(/[A-Z]/g, l => `-${l.toLowerCase()}`), value, "important")
        node.style.setProperty("background-size", values.backgroundSize || "auto", "important")
        node.style.setProperty("background-position", "0 0", "important")
    }
    function valid(value: unknown): value is PatternConfig {
        if (!value || typeof value !== "object") return false
        const c = value as PatternConfig
        return ["dots", "striped", "grid"].includes(c.pattern) && [c.primaryColour, c.backgroundColour].every(v => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v)) &&
            Object.entries({ scale: [.1, 3], spacing: [10, 100], opacity: [.1, 1], primaryRotation: [0, 180], secondaryRotation: [0, 180] }).every(([key, range]) => {
                const value = c[key as keyof PatternConfig]
                return typeof value === "number" && Number.isFinite(value) && value >= range[0] && value <= range[1]
            })
    }
    function blend(a: string, b: string, t: number) {
        const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16)
        return "#" + [16, 8, 0].map(shift => Math.round(((x >> shift) & 255) + (((y >> shift) & 255) - ((x >> shift) & 255)) * t).toString(16).padStart(2, "0")).join("")
    }
    function updateBackgrounds(configs: Record<string, unknown>) {
        for (const id of originals.keys()) {
            if (valid(configs[id])) continue
            cancelAnimationFrame(animations.get(id) || 0)
            const node = targets.get(id)!
            const original = originals.get(id)
            if (original === null) node.removeAttribute("style")
            else node.setAttribute("style", original!)
            originals.delete(id)
            displayed.delete(id)
            originalBackgrounds.delete(id)
        }
        for (const [id, config] of Object.entries(configs)) {
            const node = targets.get(id)
            if (!node || !valid(config)) continue
            const from = displayed.get(id)
            if (from && JSON.stringify(from) === JSON.stringify(config)) continue
            if (!originals.has(id)) {
                originals.set(id, node.getAttribute("style"))
                originalBackgrounds.set(id, getComputedStyle(node).backgroundColor)
            }
            cancelAnimationFrame(animations.get(id) || 0)
            if (!from || matchMedia("(prefers-reduced-motion: reduce)").matches) {
                apply(node, config); displayed.set(id, config); continue
            }
            const start = performance.now()
            const step = (now: number) => {
                const progress = Math.min(1, (now - start) / 160)
                const t = 1 - (1 - progress) ** 3
                const next = { ...config }
                for (const key of ["scale", "spacing", "opacity", "primaryRotation", "secondaryRotation"] as const) next[key] = from[key] + (config[key] - from[key]) * t
                next.primaryColour = blend(from.primaryColour, config.primaryColour, t)
                next.backgroundColour = blend(from.backgroundColour, config.backgroundColour, t)
                displayed.set(id, next)
                apply(node, next)
                if (progress < 1) animations.set(id, requestAnimationFrame(step))
                else { animations.delete(id); displayed.set(id, config) }
            }
            animations.set(id, requestAnimationFrame(step))
        }
    }
    window.addEventListener("message", event => {
        if (event.source !== parent || event.origin !== settings.parentOrigin || event.data?.type !== "dotgrid:connect" || event.data?.session !== settings.session || !event.ports[0] || port) return
        port = event.ports[0]
        port.onmessage = message => {
            const data = message.data
            if (!data || typeof data !== "object") return
            if (data.type === "select" && (data.id === null || typeof data.id === "string")) select(data.id)
            if (data.type === "selection-mode" && typeof data.enabled === "boolean") { selecting = data.enabled; hovered = null; draw() }
            if (data.type === "backgrounds" && data.values && typeof data.values === "object" && !Array.isArray(data.values)) updateBackgrounds(data.values)
            if (data.type === "parent") {
                const node = selected ? targets.get(selected) : null
                const id = node?.parentElement?.closest(`[${attribute}]`)?.getAttribute(attribute)
                if (id) select(id)
            }
        }
        port.start()
        send({ type: "ready", targets: nodes.map(metadata) })
    })
    window.addEventListener("pointermove", event => {
        if (!selecting || performance.now() - lastHover < 24) return
        lastHover = performance.now()
        const node = (event.target as Element)?.closest?.<HTMLElement>(`[${attribute}]`)
        hovered = node?.getAttribute(attribute) ?? null
        draw()
    }, true)
    document.addEventListener("pointerleave", () => { hovered = null; draw() })
    document.addEventListener("click", event => {
        // This is an editor: links and submissions never navigate away from the document.
        if ((event.target as Element)?.closest?.("a,button,input[type=submit]")) event.preventDefault()
        if (!selecting) return
        event.preventDefault()
        event.stopPropagation()
        const node = (event.target as Element)?.closest?.(`[${attribute}]`)
        if (node) select(node.getAttribute(attribute))
    }, true)
    document.addEventListener("submit", event => event.preventDefault(), true)
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") { event.preventDefault(); send({ type: "escape" }) }
    }, true)
    window.addEventListener("scroll", draw, true)
    window.addEventListener("resize", draw)
    const observer = new ResizeObserver(draw)
    nodes.forEach(node => observer.observe(node))
    window.addEventListener("pagehide", () => { observer.disconnect(); animations.forEach(cancelAnimationFrame); port?.close() })
    parent.postMessage({ type: "dotgrid:ready", session: settings.session }, settings.parentOrigin)
}
