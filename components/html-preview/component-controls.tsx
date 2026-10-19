"use client"

import { ChevronDown, Donut, Undo2 } from "lucide-react"
import type { LayerStack, PatternConfig } from "@/app/types/grid-config"
import type { PreviewTarget } from "@/lib/html-preview/types"
import { emptyStack } from "@/lib/pattern-layers"
import { LayerPanel } from "@/components/layers/layer-panel"

interface Props {
    target: PreviewTarget | undefined
    stack: LayerStack | undefined
    initialConfig: PatternConfig
    onChange: (stack: LayerStack) => void
    onApply: () => void
    onRestore: () => void
    onExport: () => void
    canExport: boolean
    expanded: boolean
    onToggle: () => void
}
export function ComponentControls({
    target,
    stack,
    initialConfig,
    onChange,
    onApply,
    onRestore,
    onExport,
    canExport,
    expanded,
    onToggle,
}: Props) {
    return (
        <aside
            className={`cw-controls ${expanded ? "cw-controls-expanded" : ""}`}
            aria-label="Component background controls"
        >
            <div className="cw-controls-heading">
                <h2>Background</h2>
                <button
                    type="button"
                    className="cw-mobile-toggle cw-icon-button"
                    aria-label={
                        expanded
                            ? "Collapse background controls"
                            : "Expand background controls"
                    }
                    aria-expanded={expanded}
                    aria-controls="cw-control-body"
                    onClick={onToggle}
                >
                    <ChevronDown
                        size={18}
                        className={expanded ? "cw-chevron-up" : ""}
                    />
                </button>
            </div>
            <div className="cw-layer-content" id="cw-control-body">
                {!target ? (
                    <div className="cw-empty-controls">
                        <Donut size={26} strokeWidth={1} />
                        <h3>Choose a background</h3>
                        <p>
                            Click a section or card in the preview, or choose an
                            element from the target list.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="cw-target-info">
                            <span className="cw-muted">
                                Editing background of
                            </span>
                            <code>{target.label}</code>
                            <span className="cw-target-size">
                                {target.width} × {target.height} px
                            </span>
                        </div>
                        {!stack?.layers.length && (
                            <button
                                className="cw-button cw-primary cw-apply"
                                type="button"
                                onClick={onApply}
                            >
                                Apply pattern
                            </button>
                        )}
                        {stack?.layers.length ? (
                            <button
                                type="button"
                                className="cw-restore cw-restore-stack"
                                onClick={onRestore}
                            >
                                <Undo2 size={14} />
                                Restore original background
                            </button>
                        ) : null}
                        <LayerPanel
                            stack={stack ?? emptyStack()}
                            onChange={onChange}
                            initialConfig={initialConfig}
                            scope={`component-${target.id}`}
                            onExport={canExport ? onExport : undefined}
                        />
                    </>
                )}
            </div>
        </aside>
    )
}
