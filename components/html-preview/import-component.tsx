"use client"

import { useRef, useState } from "react"
import { FileUp, FileCode2, Upload, X, ArrowRight } from "lucide-react"
import { COMPONENT_SAMPLES } from "@/lib/html-preview/samples"
import { MAX_SOURCE_BYTES } from "@/lib/html-preview/types"

export interface ImportSource { name: string; html: string; css: string; allowRemoteAssets: boolean }
interface Props { initial?: ImportSource; onImport: (source: ImportSource) => void; onClose: () => void; error: string }
export function ImportComponent({ initial, onImport, onClose, error }: Props) {
    const [tab, setTab] = useState<"upload" | "paste">("upload")
    const [html, setHtml] = useState(initial?.html || "")
    const [css, setCss] = useState(initial?.css || "")
    const [name, setName] = useState(initial?.name || "component.html")
    const [allowRemoteAssets, setAllowRemoteAssets] = useState(initial?.allowRemoteAssets || false)
    const [fileError, setFileError] = useState("")
    const [reading, setReading] = useState(false)
    const [dragging, setDragging] = useState(false)
    const fileInput = useRef<HTMLInputElement>(null)
    const readSequence = useRef(0)
    async function filesSelected(files: File[]) {
        const sequence = ++readSequence.current
        setFileError("")
        setReading(false)
        if (!files.length) return
        if (files.some(f => !/\.(html?|css)$/i.test(f.name))) { setFileError("Choose an HTML file and optional CSS files."); return }
        const htmlFiles = files.filter(f => /\.html?$/i.test(f.name))
        if (htmlFiles.length > 1) { setFileError("Import one HTML document at a time."); return }
        if (!htmlFiles.length && !html.trim()) { setFileError("Choose an HTML file first, or paste your HTML."); return }
        if (files.reduce((sum, f) => sum + f.size, 0) > MAX_SOURCE_BYTES) { setFileError("Keep HTML and CSS under 2 MB combined."); return }
        setReading(true)
        try {
            const contents = await Promise.all(files.map(async file => ({ name: file.name, text: await file.text() })))
            if (sequence !== readSequence.current) return
            const page = contents.find(f => /\.html?$/i.test(f.name))
            const styles = contents.filter(f => /\.css$/i.test(f.name)).map(f => f.text).join("\n")
            const nextHtml = page?.text ?? html
            const nextCss = styles || (page ? "" : css)
            if (new Blob([nextHtml, nextCss]).size > MAX_SOURCE_BYTES) throw new Error("Keep HTML and CSS under 2 MB combined.")
            setHtml(nextHtml); setCss(nextCss)
            if (page) setName(page.name)
        } catch (reason) { setFileError(reason instanceof Error ? reason.message : "This file could not be read. Please try another file.") }
        finally { if (sequence === readSequence.current) setReading(false) }
    }
    return <div className="cw-modal-backdrop">
        <section className="cw-import" role="dialog" aria-modal="true" aria-labelledby="cw-import-title">
            <div className="cw-heading-row"><h2 id="cw-import-title">Your component. Your pattern.</h2><button className="cw-icon-button" type="button" aria-label="Close import" onClick={onClose}><X size={18} /></button></div>
            <p className="cw-muted">Bring in your HTML, then pick a background to make your own.</p>
            <div className="cw-tabs" role="tablist" aria-label="Import method">
                {(["upload", "paste"] as const).map(method => <button key={method} id={`cw-${method}-tab`} aria-controls={`cw-${method}-panel`} role="tab" aria-selected={tab === method} onClick={() => setTab(method)} onKeyDown={event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); const next = method === "upload" ? "paste" : "upload"; setTab(next); document.getElementById(`cw-${next}-tab`)?.focus() } }}>{method === "upload" ? "Upload file" : "Paste code"}</button>)}
            </div>
            <div id="cw-upload-panel" role="tabpanel" aria-labelledby="cw-upload-tab" hidden={tab !== "upload"}>
                <div className={`cw-dropzone ${dragging ? "cw-dragging" : ""}`} onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); void filesSelected(Array.from(event.dataTransfer.files)) }}>
                    <FileUp size={26} strokeWidth={1.5} /><strong>{html ? name : "Drop your component here"}</strong><span className="cw-muted">HTML file · optional CSS · up to 2 MB</span>
                    <button className="cw-button cw-primary" type="button" disabled={reading} onClick={() => fileInput.current?.click()}><Upload size={15} />{reading ? "Reading files…" : html ? "Change files" : "Choose files"}</button>
                    <input ref={fileInput} type="file" accept=".html,.htm,.css,text/html,text/css" multiple className="cw-sr-only" aria-label="Component files" onChange={event => { void filesSelected(Array.from(event.target.files || [])); event.target.value = "" }} />
                </div>
                {html && <p className="cw-file-detail"><FileCode2 size={14} />{name}{css ? " + CSS" : ""}</p>}
            </div>
            <div id="cw-paste-panel" role="tabpanel" aria-labelledby="cw-paste-tab" hidden={tab !== "paste"}>
                <label className="cw-field-label" htmlFor="cw-html">HTML</label><textarea id="cw-html" spellCheck={false} value={html} placeholder={'<section class="hero">\n  <h1>Your next big idea.</h1>\n</section>'} onChange={event => setHtml(event.target.value)} />
                <label className="cw-field-label" htmlFor="cw-css">CSS <span className="cw-muted">(optional)</span></label><textarea id="cw-css" className="cw-css-input" spellCheck={false} value={css} placeholder={'.hero { padding: 64px; }'} onChange={event => setCss(event.target.value)} />
            </div>
            <label className="cw-checkbox"><input type="checkbox" checked={allowRemoteAssets} onChange={event => setAllowRemoteAssets(event.target.checked)} />Load external images, fonts, and CSS over HTTPS</label>
            <p className="cw-hint">Files stay in your browser. Scripts are disabled. External assets contact their original hosts when enabled.</p>
            {(error || fileError) && <p role="alert" className="cw-error">{fileError || error}</p>}
            <div className="cw-import-action"><button type="button" className="cw-button cw-primary" disabled={!html.trim() || reading} onClick={() => onImport({ name, html, css, allowRemoteAssets })}>Preview component<ArrowRight size={16} /></button></div>
            <div className="cw-sample-heading">Or try a sample component</div>
            <div className="cw-samples">{COMPONENT_SAMPLES.map(sample => <button type="button" key={sample.id} className="cw-sample" onClick={() => onImport({ name: sample.name, html: sample.html, css: "", allowRemoteAssets: false })}><div className={`cw-mini cw-mini-${sample.id}`}><span /><span /><span /></div><strong>{sample.label}</strong><span className="cw-muted">{sample.description}</span></button>)}</div>
        </section>
    </div>
}
