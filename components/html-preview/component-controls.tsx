"use client"

import { ChevronDown, Code, Diamond, Donut, LineChart, RotateCw, Undo2 } from "lucide-react"
import type { PatternConfig } from "@/app/types/grid-config"
import type { PreviewTarget } from "@/lib/html-preview/types"
import { COMPONENT_PRESETS } from "@/lib/html-preview/presets"
import { RangeSlider } from "@/components/ui/range-slider"

interface Props {
    target: PreviewTarget | undefined
    config: PatternConfig
    applied: boolean
    onChange: (config: Partial<PatternConfig>) => void
    onReset: () => void
    onRestore: () => void
    onExport: () => void
    canExport: boolean
    expanded: boolean
    onToggle: () => void
}
const types = ["dots", "striped", "grid"] as const
const numbers = [
    { key: "scale", name: "Scale", min: .1, max: 3, step: .1, unit: "x" },
    { key: "spacing", name: "Spacing", min: 10, max: 100, step: 1, unit: " px" },
    { key: "opacity", name: "Opacity", min: .1, max: 1, step: .1, unit: "%" },
    { key: "primaryRotation", name: "Rotation A", min: 0, max: 180, step: 1, unit: "°" },
    { key: "secondaryRotation", name: "Rotation B", min: 0, max: 180, step: 1, unit: "°" },
] as const
function format(value: number, unit: string) { return (unit === "%" ? Math.round(value * 100) : Number(value.toFixed(1))) + unit }
export function ComponentControls({ target, config, applied, onChange, onReset, onRestore, onExport, canExport, expanded, onToggle }: Props) {
    const PatternIcon = config.pattern === "dots" ? Donut : config.pattern === "grid" ? Diamond : LineChart
    const preset = COMPONENT_PRESETS.find(p => Object.entries(p.config).every(([key, value]) => config[key as keyof PatternConfig] === value))?.label ?? ""
    return <aside className={`cw-controls ${expanded ? "cw-controls-expanded" : ""}`} aria-label="Component background controls">
        <div className="cw-controls-heading"><h2>Background</h2><button type="button" className="cw-mobile-toggle cw-icon-button" aria-label={expanded ? "Collapse background controls" : "Expand background controls"} aria-expanded={expanded} aria-controls="cw-control-body" onClick={onToggle}><ChevronDown size={18} className={expanded ? "cw-chevron-up" : ""} /></button></div>
        <div className="cw-control-scroll" id="cw-control-body">
            {!target ? <div className="cw-empty-controls"><Donut size={26} strokeWidth={1} /><h3>Choose a background</h3><p>Click a section or card in the preview, or choose an element from the target list.</p></div> : <>
                <div className="cw-target-info"><span className="cw-muted">Editing background of</span><code>{target.label}</code><span className="cw-target-size">{target.width} × {target.height} px</span></div>
                {!applied && <button className="cw-button cw-primary cw-apply" type="button" onClick={() => onChange(config)}>Apply pattern</button>}
                <div className="cw-type-row"><button type="button" className="cw-button cw-primary" onClick={() => onChange({ pattern: types[(types.indexOf(config.pattern) + 1) % types.length] })}><PatternIcon size={16} />{config.pattern === "striped" ? "Striped" : config.pattern === "grid" ? "Grid" : "Dots"}</button><button type="button" className="cw-icon-button cw-reset" aria-label="Reset selected pattern" onClick={onReset}><RotateCw size={16} strokeWidth={1} /></button></div>
                {numbers.filter(n => config.pattern !== "dots" || !n.key.endsWith("Rotation")).filter(n => n.key !== "secondaryRotation" || config.pattern === "grid").map(n => <div key={n.key} className="cw-range-group"><div className="cw-range-label"><span>{n.name}</span><output>{format(config[n.key], n.unit)}</output></div><RangeSlider min={n.min} max={n.max} step={n.step} value={config[n.key]} aria-label={`Component ${n.name}`} formatValueText={value => format(value, n.unit)} onValueChange={value => onChange({ [n.key]: value })} className="cw-range" /></div>)}
                {(["primaryColour", "backgroundColour"] as const).map((key, index) => <div className="cw-color" key={key}><label htmlFor={`cw-${key}`}>{index ? "Background colour" : "Primary colour"}</label><div><input type="color" id={`cw-${key}`} value={config[key]} onChange={event => onChange({ [key]: event.target.value })} /><span>{config[key]}</span></div></div>)}
                <button type="button" className="cw-restore" disabled={!applied} onClick={onRestore}><Undo2 size={14} />Restore original background</button>
                {target.width === 0 || target.height === 0 ? <p className="cw-hint">This element has no visible area. Try its parent.</p> : null}
            </>}
        </div>
        <footer className="cw-controls-footer"><select aria-label="Component preset" disabled={!target} value={preset} onChange={event => { const next = COMPONENT_PRESETS.find(p => p.label === event.target.value); if (next) onChange(next.config) }}><option value="">Presets</option>{COMPONENT_PRESETS.map(p => <option key={p.label}>{p.label}</option>)}</select><button className="cw-button" type="button" disabled={!canExport} onClick={onExport}><Code size={15} />Export CSS</button></footer>
    </aside>
}
