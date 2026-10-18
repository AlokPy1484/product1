"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Code, CornerLeftUp, Download, FileCode2, Monitor, Scan, Smartphone, Tablet, Upload, X } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { useGridConfig } from "@/app/context/GridConfigContext"
import { DEFAULT_PATTERN_CONFIG, type PatternConfig } from "@/app/types/grid-config"
import { getLabelContrast } from "@/lib/color-contrast"
import { buildPreviewDocument, type PreparedDocument } from "@/lib/html-preview/build-document"
import { downloadText, exportBackgrounds } from "@/lib/html-preview/export"
import { readProject, saveProject, saveRecovery } from "@/lib/html-preview/storage"
import type { ComponentProject, PreviewTarget } from "@/lib/html-preview/types"
import { ComponentControls } from "./component-controls"
import { HtmlPreview } from "./html-preview"
import { ImportComponent, type ImportSource } from "./import-component"
import "./workspace.css"

interface Props { open: boolean; onClose: () => void }
function targetDefaults(target: PreviewTarget | undefined, canvas: PatternConfig): PatternConfig {
    const rgb = target?.background.match(/^rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)(?:[, /]+([\d.]+))?\)/)
    const backgroundColour = rgb && (!rgb[4] || Number(rgb[4]) === 1) ? "#" + rgb.slice(1, 4).map(n => Number(n).toString(16).padStart(2, "0")).join("") : "#ffffff"
    return { ...canvas, backgroundColour, primaryColour: getLabelContrast(backgroundColour).color }
}
export default function ComponentWorkspace({ open, onClose }: Props) {
    const { config: canvasConfig } = useGridConfig()
    const [project, setProject] = useState<ComponentProject | null>(null)
    const [prepared, setPrepared] = useState<PreparedDocument | null>(null)
    const [targets, setTargets] = useState<PreviewTarget[]>([])
    const [importOpen, setImportOpen] = useState(true)
    const [exportOpen, setExportOpen] = useState(false)
    const [error, setError] = useState("")
    const [status, setStatus] = useState("Choose a component to begin.")
    const [storageStatus, setStorageStatus] = useState("")
    const [selecting, setSelecting] = useState(true)
    const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
    const [controlsOpen, setControlsOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [closing, setClosing] = useState(false)
    const root = useRef<HTMLDivElement>(null)
    const operation = useRef(0)
    const projectRef = useRef(project)
    useEffect(() => { projectRef.current = project }, [project])
    const install = useCallback((next: ComponentProject) => {
        try {
            const document = buildPreviewDocument(next)
            operation.current++
            setPrepared(document); setProject(next); projectRef.current = next
            setTargets([]); setImportOpen(false); setError(""); setCopied(false); setSelecting(true)
            setStatus("Click a section or card, then apply your pattern.")
        } catch (reason) { setError(reason instanceof Error ? reason.message : "This component could not be imported."); setImportOpen(true) }
    }, [])
    useEffect(() => {
        let active = true
        const currentOperation = operation.current
        readProject().then(saved => { if (active && operation.current === currentOperation && saved) install(saved) }).catch(() => { if (active) setStorageStatus("Browser storage unavailable; editing and exports still work.") })
        return () => { active = false }
    }, [install])
    useEffect(() => {
        if (!project) return
        const timeout = setTimeout(() => { saveProject(project).then(() => setStorageStatus("Saved in this browser")).catch(() => setStorageStatus("Couldn't save in this browser. Download HTML to keep your work.")) }, 350)
        return () => clearTimeout(timeout)
    }, [project])
    useEffect(() => {
        const flush = () => { if (projectRef.current) { saveRecovery(projectRef.current); void saveProject(projectRef.current).catch(() => {}) } }
        window.addEventListener("pagehide", flush)
        const visibility = () => { if (document.visibilityState === "hidden") flush() }
        document.addEventListener("visibilitychange", visibility)
        return () => { flush(); window.removeEventListener("pagehide", flush); document.removeEventListener("visibilitychange", visibility) }
    }, [])
    useEffect(() => {
        if (!open || !root.current) return
        const previousFocus = document.activeElement as HTMLElement | null
        const siblings = Array.from(document.body.children).filter((el): el is HTMLElement => el instanceof HTMLElement && el !== root.current && !el.contains(root.current))
        const old = siblings.map(el => ({ el, inert: el.inert }))
        old.forEach(({ el }) => { el.inert = true })
        const overflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        root.current.querySelector<HTMLElement>("button")?.focus()
        return () => { old.forEach(({ el, inert }) => { el.inert = inert }); document.body.style.overflow = overflow; previousFocus?.focus({ preventScroll: true }) }
    }, [open])
    useEffect(() => {
        if (!open) return
        const frame = requestAnimationFrame(() => {
            const dialog = root.current?.querySelector<HTMLElement>(".cw-modal-backdrop section") ?? root.current
            dialog?.querySelector<HTMLElement>("button")?.focus()
        })
        return () => cancelAnimationFrame(frame)
    }, [open, importOpen, exportOpen])
    const selected = targets.find(target => target.id === project?.selectedId)
    const config = selected ? project?.backgrounds[selected.id] ?? targetDefaults(selected, canvasConfig) : DEFAULT_PATTERN_CONFIG
    function changeConfig(partial: Partial<PatternConfig>) {
        if (!selected) return
        setProject(previous => previous ? { ...previous, backgrounds: { ...previous.backgrounds, [selected.id]: { ...(previous.backgrounds[selected.id] ?? config), ...partial } } } : previous)
        setStatus(`Editing ${selected.label} · other backgrounds stay unchanged.`)
    }
    const onSelect = useCallback((target: PreviewTarget | null) => {
        setProject(previous => previous && previous.selectedId !== (target?.id ?? null) ? { ...previous, selectedId: target?.id ?? null } : previous)
        if (target) { setTargets(previous => previous.map(item => item.id === target.id ? target : item)); setStatus(`Selected ${target.label}. Adjust a control or apply the pattern.`) }
    }, [])
    const onTargets = useCallback((next: PreviewTarget[]) => {
        setTargets(next)
        setProject(previous => previous && previous.selectedId && !next.some(t => t.id === previous.selectedId) ? { ...previous, selectedId: null } : previous)
    }, [])
    const close = async () => {
        if (closing) return
        setClosing(true)
        try { if (projectRef.current) await saveProject(projectRef.current) }
        catch { toast.add({ title: "Couldn't save component", description: "Reopen the component workspace and download HTML to keep your work.", type: "error" }) }
        finally { setClosing(false); onClose() }
    }
    const escapePreview = () => { if (selecting) setSelecting(false); else close() }
    const exportData = useMemo(() => exportOpen && project && prepared ? exportBackgrounds(project, prepared.cleanHtml) : null, [exportOpen, project, prepared])
    function importSource(source: ImportSource) {
        const same = project && project.html === source.html && project.css === source.css
        install({ version: 1, id: same ? project.id : crypto.randomUUID(), name: source.name, html: source.html, css: source.css, allowRemoteAssets: source.allowRemoteAssets, backgrounds: same ? project.backgrounds : {}, selectedId: same ? project.selectedId : null })
    }
    function download() {
        if (!exportData || !project) return
        downloadText(project.name.replace(/\.[^.]+$/, "") + "-dotgrid.html", exportData.html, "text/html;charset=utf-8")
        setStatus("Downloaded the static HTML with your backgrounds.")
    }
    async function copy() {
        if (!exportData) return
        try { await navigator.clipboard.writeText(exportData.css); setCopied(true) }
        catch { setStatus("Clipboard access failed. Download CSS instead."); setCopied(false) }
    }
    if (!open) return null
    return createPortal(<div className="component-workspace" ref={root} role="dialog" aria-modal="true" aria-labelledby="cw-title" onKeyDown={event => {
        if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); if (exportOpen) setExportOpen(false); else if (importOpen && project) setImportOpen(false); else close() }
        if (event.key === "Tab") {
            const dialog = root.current?.querySelector<HTMLElement>(".cw-modal-backdrop section") ?? root.current
            const elements = Array.from(dialog?.querySelectorAll<HTMLElement>("button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea,iframe") || []).filter(el => !el.closest("[hidden]") && el.getClientRects().length > 0)
            const first = elements[0], last = elements[elements.length - 1]
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
        }
    }}>
        <div className="cw-app" inert={importOpen || exportOpen}>
            <header className="cw-topbar"><strong>dotgrid.io</strong><h1 id="cw-title">Component preview</h1><button type="button" className="cw-icon-button" aria-label="Back to pattern canvas" disabled={closing} onClick={() => void close()}><X size={19} /></button></header>
            <div className="cw-layout">
                <ComponentControls target={selected} config={config} applied={!!(selected && project?.backgrounds[selected.id])} onChange={changeConfig} onReset={() => changeConfig(DEFAULT_PATTERN_CONFIG)} onRestore={() => { if (!selected) return; setProject(previous => { if (!previous) return previous; const backgrounds = { ...previous.backgrounds }; delete backgrounds[selected.id]; return { ...previous, backgrounds } }); setStatus("Original background restored.") }} onExport={() => { setExportOpen(true); setCopied(false) }} canExport={!!project && Object.keys(project.backgrounds).length > 0} expanded={controlsOpen} onToggle={() => setControlsOpen(value => !value)} />
                <main className="cw-workspace-main">
                    <div className="cw-filebar"><span className="cw-filename"><FileCode2 size={17} /><span>{project?.name || "Your component"}</span></span><button type="button" className="cw-button" onClick={() => { setError(""); setImportOpen(true) }}><Upload size={15} />{project ? "Replace component" : "Upload component"}</button></div>
                    <div className="cw-preview-toolbar"><div className="cw-tools"><button type="button" className="cw-tool" disabled={!prepared} aria-pressed={selecting} onClick={() => setSelecting(value => !value)}><Scan size={15} />Select element</button><button type="button" className="cw-tool" disabled={!selected?.parentId} onClick={() => setProject(previous => previous && selected?.parentId ? { ...previous, selectedId: selected.parentId } : previous)}><CornerLeftUp size={15} />Parent</button></div><div className="cw-devices" aria-label="Preview viewport">{(["desktop", "tablet", "mobile"] as const).map(size => { const Icon = size === "desktop" ? Monitor : size === "tablet" ? Tablet : Smartphone; return <button type="button" key={size} className="cw-tool" aria-pressed={device === size} aria-label={`${size[0].toUpperCase() + size.slice(1)} preview`} onClick={() => setDevice(size)}><Icon size={15} /></button> })}</div></div>
                    <div className={`cw-preview-viewport cw-device-${device}`}>
                        {project && prepared ? <HtmlPreview key={prepared.session} document={prepared} backgrounds={project.backgrounds} selectedId={project.selectedId} selecting={selecting} onTargets={onTargets} onSelect={onSelect} onEscape={escapePreview} /> : <div className="cw-empty-preview"><FileCode2 size={32} strokeWidth={1} /><h2>Preview your component</h2><p>Upload HTML or start with a sample.</p><button type="button" className="cw-button cw-primary" onClick={() => setImportOpen(true)}>Choose a component</button></div>}
                    </div>
                    <div className="cw-targetbar"><label htmlFor="cw-target">Target</label><select id="cw-target" disabled={!targets.length} value={project?.selectedId || ""} onChange={event => setProject(previous => previous ? { ...previous, selectedId: event.target.value || null } : previous)}><option value="">Choose an element…</option>{targets.map(target => <option key={target.id} value={target.id}>{target.label} · {target.id.replace("target-", "#")}</option>)}</select><span className="cw-save-status">{storageStatus}</span></div>
                    <div className="cw-status" role="status">{status}</div>
                    {prepared?.warnings.length ? <details className="cw-warnings"><summary>Import notes ({prepared.warnings.length})</summary>{prepared.warnings.map(warning => <p key={warning}>{warning}</p>)}</details> : null}
                </main>
            </div>
        </div>
        {importOpen && <ImportComponent initial={project ?? undefined} onImport={importSource} error={error} onClose={() => project ? setImportOpen(false) : close()} />}
        {exportOpen && exportData && <div className="cw-modal-backdrop"><section className="cw-import cw-export" role="dialog" aria-modal="true" aria-labelledby="cw-export-title"><div className="cw-heading-row"><h2 id="cw-export-title">Your component backgrounds</h2><button type="button" className="cw-icon-button" aria-label="Close export" onClick={() => setExportOpen(false)}><X size={18} /></button></div><p className="cw-muted">The downloaded HTML includes these classes and styles. Scripts and preview tools are excluded.</p><pre>{exportData.css || "/* No custom backgrounds applied yet. */"}</pre><p className="cw-hint">When copying CSS to your original project, add the matching classes to its elements. Download HTML to handle existing inline backgrounds automatically.</p><div className="cw-export-actions"><button type="button" className="cw-button" onClick={() => { downloadText("dotgrid-backgrounds.css", exportData.css, "text/css;charset=utf-8") }}><Code size={15} />Download CSS</button><button type="button" className="cw-button" onClick={() => void copy()}>{copied ? "Copied" : "Copy CSS"}</button><button type="button" className="cw-button cw-primary" onClick={download}><Download size={15} />Download HTML</button></div><p className="cw-hint" aria-live="polite">{copied ? "CSS copied to clipboard." : status.startsWith("Clipboard") ? status : ""}</p></section></div>}
    </div>, document.body)
}
