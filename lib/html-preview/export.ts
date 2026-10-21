import { getLayerStackCSS } from "@/app/utils.ts/pattern-utils"
import { TARGET_ATTRIBUTE, type ComponentProject } from "./types"

const properties = ["background-image", "background-color", "background-size", "background-repeat", "background-position"]
export function exportBackgrounds(project: ComponentProject, cleanHtml: string) {
    const doc = new DOMParser().parseFromString(cleanHtml, "text/html")
    const rules: string[] = []
    for (const [id, config] of Object.entries(project.backgrounds)) {
        const node = Array.from(doc.querySelectorAll<HTMLElement>(`[${TARGET_ATTRIBUTE}]`)).find(n => n.getAttribute(TARGET_ATTRIBUTE) === id)
        if (!node) continue
        let className = `dotgrid-bg-${project.id.replace(/[^\w-]/g, "").slice(0, 12)}-${id.replace("target-", "")}`
        while (doc.getElementsByClassName(className).length) className += "-bg"
        node.classList.add(className)
        // Removing only edited background properties lets the exported rule beat inline !important backgrounds.
        properties.forEach(property => node.style.removeProperty(property))
        const values = getLayerStackCSS(config)
        const css = Object.entries(values).map(([key, value]) => `  ${key.replace(/[A-Z]/g, l => `-${l.toLowerCase()}`)}: ${String(value).replace(/\s+/g, " ").trim()} !important;`).join("\n")
        rules.push(`.${className} {\n${css}\n}`)
    }
    doc.querySelectorAll(`[${TARGET_ATTRIBUTE}]`).forEach(node => node.removeAttribute(TARGET_ATTRIBUTE))
    const css = rules.join("\n\n")
    if (css) { const style = doc.createElement("style"); style.textContent = css; doc.head.append(style) }
    // The download is the sanitized static document, never our bridge or the user's executable scripts.
    const charset = doc.createElement("meta"); charset.setAttribute("charset", "utf-8"); doc.head.prepend(charset)
    return { css, html: "<!doctype html>\n" + doc.documentElement.outerHTML }
}
export function downloadText(name: string, value: string, type: string) {
    const url = URL.createObjectURL(new Blob([value], { type }))
    const anchor = document.createElement("a")
    anchor.href = url; anchor.download = name; anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}
