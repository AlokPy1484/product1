import createDOMPurify from "dompurify"
import { getPatternCSS } from "@/app/utils.ts/pattern-utils"
import { previewBridge } from "./preview-bridge"
import { MAX_SOURCE_BYTES, TARGET_ATTRIBUTE, type ComponentProject } from "./types"

export interface PreparedDocument { srcDoc: string; cleanHtml: string; session: string; warnings: string[] }
const containers = "body,main,section,article,aside,header,footer,nav,div,figure,form,ul,ol,li,table,td,blockquote"

/** Browser-only. Sanitization is reinforced by an opaque sandbox and a nonce-only script policy. */
export function buildPreviewDocument(project: ComponentProject): PreparedDocument {
    if (!project.html.trim()) throw new Error("Add HTML or choose a sample component first.")
    if (new Blob([project.html, project.css]).size > MAX_SOURCE_BYTES) throw new Error("Keep the combined HTML and CSS under 2 MB.")
    const purifier = createDOMPurify(window)
    const clean = purifier.sanitize(project.html, {
        WHOLE_DOCUMENT: true,
        FORBID_TAGS: ["script", "iframe", "frame", "frameset", "object", "embed", "base", "meta", "noscript", "template", "animate", "set", "foreignObject"],
        FORBID_ATTR: ["srcdoc", "nonce", "is", "action", "formaction", "target", "download", "autofocus", "autoplay"],
        ADD_TAGS: ["link"],
    })
    const doc = new DOMParser().parseFromString(clean, "text/html")
    if (doc.querySelectorAll("*").length > 5000) throw new Error("This document is too large. Import a component with fewer than 5,000 elements.")
    // User-provided instrumentation cannot impersonate a target or our own UI.
    for (const element of doc.querySelectorAll("*")) {
        for (const attr of Array.from(element.attributes)) if (attr.name.startsWith("data-dotgrid-")) element.removeAttribute(attr.name)
    }
    for (const link of doc.querySelectorAll("link")) if (link.rel.toLowerCase() !== "stylesheet") link.remove()
    if (project.css.trim()) {
        const style = doc.createElement("style")
        // A literal closing tag in pasted CSS must not become HTML when srcDoc is reparsed.
        style.textContent = project.css.replace(/<\/style/gi, "<\\/style")
        doc.head.append(style)
    }
    const warnings: string[] = []
    if (/<script\b|\son\w+\s*=/i.test(project.html)) warnings.push("Scripts and inline event handlers are disabled. This is a static HTML/CSS preview.")
    const isRelative = (value: string) => value && !/^(https?:|data:|blob:|#)/i.test(value.trim())
    const cssSource = project.css + Array.from(doc.querySelectorAll("style")).map(s => s.textContent).join("\n")
    const relative = Array.from(doc.querySelectorAll("[src],[href],[srcset]")).some(el => isRelative(el.getAttribute("src") || el.getAttribute("href") || el.getAttribute("srcset") || "")) ||
        Array.from(cssSource.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]*))\s*\)/gi)).some(match => isRelative(match[1] || match[2] || match[3] || ""))
    if (relative) warnings.push("Relative images, fonts, and stylesheet paths need their original files. Use embedded assets or absolute HTTPS URLs.")
    if (!project.allowRemoteAssets && /https?:\/\/|@import/i.test(project.html + project.css)) warnings.push("External assets are blocked. Enable remote assets in Import if this component needs them.")
    const nodes = Array.from(doc.querySelectorAll<HTMLElement>(containers))
    if (nodes.length > 1000) throw new Error("Import a smaller component with fewer than 1,000 background containers.")
    nodes.forEach((node, index) => node.setAttribute(TARGET_ATTRIBUTE, `target-${index}`))
    const cleanHtml = "<!doctype html>\n" + doc.documentElement.outerHTML
    const session = crypto.randomUUID()
    const nonce = crypto.randomUUID().replaceAll("-", "")
    const assets = project.allowRemoteAssets ? " https:" : ""
    const policy = doc.createElement("meta")
    policy.httpEquiv = "Content-Security-Policy"
    policy.content = `default-src 'none'; script-src 'nonce-${nonce}'; script-src-attr 'none'; style-src 'unsafe-inline'${assets}; img-src data: blob:${assets}; font-src data:${assets}; connect-src 'none'; media-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`
    const viewport = doc.createElement("meta")
    viewport.name = "viewport"; viewport.content = "width=device-width,initial-scale=1"
    const charset = doc.createElement("meta"); charset.setAttribute("charset", "utf-8")
    doc.head.prepend(charset, policy, viewport)
    const script = doc.createElement("script")
    script.setAttribute("nonce", nonce)
    const settings = JSON.stringify({ session, projectId: project.id, parentOrigin: location.origin }).replace(/</g, "\\u003c")
    script.textContent = `(${previewBridge.toString()})(${settings}, ${getPatternCSS.toString()});`
    doc.body.append(script)
    return { srcDoc: "<!doctype html>\n" + doc.documentElement.outerHTML, cleanHtml, session, warnings }
}
