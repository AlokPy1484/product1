"use client"

import { useState } from "react"
import {
    AnimatePresence,
    motion,
    Reorder,
    useDragControls,
    useIsPresent,
    useReducedMotion,
} from "motion/react"
import {
    ChevronDown,
    Copy,
    Diamond,
    Donut,
    GripVertical,
    Layers,
    LineChart,
    Plus,
    Trash2,
} from "lucide-react"
import type {
    LayerStack,
    PatternConfig,
    PatternLayer,
} from "@/app/types/grid-config"
import { MAX_LAYERS, updateStack, type StackAction } from "@/lib/pattern-layers"
import { COMPONENT_PRESETS } from "@/lib/html-preview/presets"
import { getLayerStackCSSText } from "@/app/utils.ts/pattern-utils"
import { RangeSlider } from "@/components/ui/range-slider"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { toast } from "@/components/ui/toast"
import "./layer-panel.css"

interface Props {
    stack: LayerStack
    onChange: (stack: LayerStack) => void
    initialConfig?: PatternConfig
    scope: string
    onExport?: () => void
}
const types = ["dots", "striped", "grid"] as const
const parameters = [
    { key: "scale", label: "Scale", min: 0.1, max: 3, step: 0.1, unit: "x" },
    {
        key: "spacing",
        label: "Spacing",
        min: 10,
        max: 100,
        step: 1,
        unit: " px",
    },
    {
        key: "opacity",
        label: "Opacity",
        min: 0.1,
        max: 1,
        step: 0.1,
        unit: "%",
    },
    {
        key: "primaryRotation",
        label: "Rotation A",
        min: 0,
        max: 180,
        step: 1,
        unit: "°",
    },
    {
        key: "secondaryRotation",
        label: "Rotation B",
        min: 0,
        max: 180,
        step: 1,
        unit: "°",
    },
] as const
const format = (value: number, unit: string) =>
    `${unit === "%" ? Math.round(value * 100) : Number(value.toFixed(1))}${unit}`
const timing = {
    duration: 0.24,
    ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
}
function LayerFields({
    layer,
    scope,
    dispatch,
}: {
    layer: PatternLayer
    scope: string
    dispatch: (action: StackAction) => void
}) {
    const present = useIsPresent()
    const config = layer.config
    const Icon =
        config.pattern === "dots"
            ? Donut
            : config.pattern === "grid"
              ? Diamond
              : LineChart
    const prefix = `${scope}-${layer.id}`
    const edit = (config: Partial<PatternConfig>) =>
        dispatch({ type: "edit", id: layer.id, config })
    return (
        <div
            className="lp-fields"
            data-layer-controls={layer.id}
            inert={!present}
            aria-hidden={!present}
        >
            <label className="lp-field-label" htmlFor={`${prefix}-name`}>
                Layer name
            </label>
            <input
                id={`${prefix}-name`}
                className="lp-name"
                value={layer.name}
                maxLength={64}
                onChange={(event) =>
                    dispatch({
                        type: "edit",
                        id: layer.id,
                        name: event.target.value,
                    })
                }
                onBlur={() => {
                    if (!layer.name.trim())
                        dispatch({
                            type: "edit",
                            id: layer.id,
                            name: "Untitled layer",
                        })
                }}
            />
            <div className="lp-type-row">
                <button
                    type="button"
                    className="lp-button lp-primary pattern-toggle"
                    onClick={() =>
                        edit({
                            pattern:
                                types[
                                    (types.indexOf(config.pattern) + 1) %
                                        types.length
                                ],
                        })
                    }
                >
                    <Icon size={16} />
                    {config.pattern === "striped"
                        ? "Striped"
                        : config.pattern === "grid"
                          ? "Grid"
                          : "Dots"}
                </button>
                <button
                    type="button"
                    className="lp-reset"
                    onClick={() =>
                        dispatch({ type: "reset-layer", id: layer.id })
                    }
                >
                    Reset layer
                </button>
            </div>
            <div className="pattern-control">
                {parameters
                    .filter(
                        (p) =>
                            config.pattern !== "dots" ||
                            !p.key.endsWith("Rotation"),
                    )
                    .filter(
                        (p) =>
                            p.key !== "secondaryRotation" ||
                            config.pattern === "grid",
                    )
                    .map((p) => (
                        <div key={p.key} className="lp-range">
                            <div>
                                <span>{p.label}</span>
                                <output>{format(config[p.key], p.unit)}</output>
                            </div>
                            <RangeSlider
                                aria-label={p.label}
                                min={p.min}
                                max={p.max}
                                step={p.step}
                                value={config[p.key]}
                                formatValueText={(value) =>
                                    format(value, p.unit)
                                }
                                onValueChange={(value) =>
                                    edit({ [p.key]: value })
                                }
                                className="lp-slider"
                            />
                        </div>
                    ))}
            </div>
            <div className="pattern-color">
                <label className="lp-checkbox">
                    <span>Transparent background</span>
                    <input
                        type="checkbox"
                        checked={!layer.backgroundEnabled}
                        onChange={(event) =>
                            dispatch({
                                type: "edit",
                                id: layer.id,
                                backgroundEnabled: !event.target.checked,
                            })
                        }
                    />
                </label>
                {(["primaryColour", "backgroundColour"] as const).map(
                    (key, index) => (
                        <div
                            className={`lp-color ${index && !layer.backgroundEnabled ? "lp-disabled" : ""}`}
                            key={key}
                        >
                            <label htmlFor={`${prefix}-${key}`}>
                                {index ? "Background colour" : "Primary colour"}
                            </label>
                            <div>
                                <input
                                    type="color"
                                    id={`${prefix}-${key}`}
                                    value={config[key]}
                                    disabled={
                                        !!index && !layer.backgroundEnabled
                                    }
                                    onChange={(event) =>
                                        edit({ [key]: event.target.value })
                                    }
                                />
                                <span>{config[key]}</span>
                            </div>
                        </div>
                    ),
                )}
            </div>
            <button
                type="button"
                className="lp-remove"
                onClick={() => dispatch({ type: "remove", id: layer.id })}
            >
                <Trash2 size={14} />
                Remove layer
            </button>
        </div>
    )
}
function LayerRow({
    layer,
    expanded,
    scope,
    index,
    count,
    dispatch,
    announce,
}: {
    layer: PatternLayer
    expanded: boolean
    scope: string
    index: number
    count: number
    dispatch: (action: StackAction) => void
    announce: (message: string) => void
}) {
    const controls = useDragControls()
    const reduce = useReducedMotion()
    const transition = { ...timing, duration: reduce ? 0 : timing.duration }
    const name = layer.name || "Untitled layer"
    return (
        <Reorder.Item
            as="div"
            value={layer.id}
            layout="position"
            dragListener={false}
            dragControls={controls}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...transition, layout: transition }}
            data-layer-id={layer.id}
            className="lp-row"
            onDragEnd={() =>
                announce(`${name} is at position ${index + 1} of ${count}.`)
            }
        >
            <div className="lp-row-heading">
                <button
                    type="button"
                    className="lp-grip"
                    aria-label={`Reorder ${name}`}
                    aria-describedby={`${scope}-reorder-help`}
                    data-base-ui-swipe-ignore=""
                    onPointerDown={(event) => {
                        if (event.button !== 0) return
                        event.stopPropagation()
                        controls.start(event)
                    }}
                    onKeyDown={(event) => {
                        if (
                            event.key === "ArrowUp" ||
                            event.key === "ArrowDown"
                        ) {
                            event.preventDefault()
                            const direction = event.key === "ArrowUp" ? -1 : 1
                            if (
                                index + direction < 0 ||
                                index + direction >= count
                            )
                                return
                            dispatch({ type: "move", id: layer.id, direction })
                            announce(
                                `${name} moved to position ${index + direction + 1} of ${count}.`,
                            )
                        }
                    }}
                >
                    <GripVertical size={16} />
                </button>
                <button
                    type="button"
                    className="lp-toggle"
                    aria-label={`${expanded ? "Collapse" : "Expand"} ${name}`}
                    aria-expanded={expanded}
                    aria-controls={`${scope}-panel-${layer.id}`}
                    onClick={() => dispatch({ type: "toggle", id: layer.id })}
                >
                    <span>{name}</span>
                    <motion.span
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={transition}
                    >
                        <ChevronDown size={16} />
                    </motion.span>
                </button>
            </div>
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        key="fields"
                        id={`${scope}-panel-${layer.id}`}
                        className="lp-collapse"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={transition}
                    >
                        <div className="lp-field-scroll">
                            <LayerFields
                                layer={layer}
                                scope={scope}
                                dispatch={dispatch}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Reorder.Item>
    )
}
export function LayerPanel({
    stack,
    onChange,
    initialConfig,
    scope,
    onExport,
}: Props) {
    const [announcement, announce] = useState("")
    const active = stack.layers.find(
        (layer) => layer.id === stack.expandedLayerId,
    )
    const presetLabel =
        (active &&
            COMPONENT_PRESETS.find((p) =>
                Object.entries(p.config).every(
                    ([key, value]) =>
                        active.config[key as keyof PatternConfig] === value,
                ),
            )?.label) ||
        "Presets"
    const dispatch = (action: StackAction) =>
        onChange(updateStack(stack, action))
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(getLayerStackCSSText(stack))
            toast.add({
                title: "All layers copied",
                description:
                    "Paste the background declarations into your CSS rule.",
                type: "success",
            })
        } catch {
            toast.add({
                title: "Couldn't copy CSS",
                description: "Allow clipboard access and try again.",
                type: "error",
            })
        }
    }
    return (
        <div className="lp-panel" data-layer-panel={scope}>
            <header className="lp-heading">
                <h2>
                    <Layers size={16} />
                    Layers
                </h2>
                <button
                    type="button"
                    className="lp-button layer-add"
                    disabled={stack.layers.length >= MAX_LAYERS}
                    onClick={() =>
                        dispatch({
                            type: "add",
                            id: crypto.randomUUID(),
                            initial: initialConfig,
                        })
                    }
                >
                    <Plus size={15} />
                    Add layer
                </button>
            </header>
            <p id={`${scope}-reorder-help`} className="lp-sr-only">
                Top row is topmost. Drag the grip, or focus it and press Up or
                Down to reorder.
            </p>
            <Reorder.Group
                as="div"
                axis="y"
                layoutScroll
                values={stack.layers.map((layer) => layer.id)}
                onReorder={(ids) => dispatch({ type: "reorder", ids })}
                className="lp-list"
            >
                {stack.layers.map((layer, index) => (
                    <LayerRow
                        key={layer.id}
                        layer={layer}
                        scope={scope}
                        expanded={layer.id === stack.expandedLayerId}
                        index={index}
                        count={stack.layers.length}
                        dispatch={dispatch}
                        announce={announce}
                    />
                ))}
                {!stack.layers.length && (
                    <p className="lp-empty">
                        No layers yet. Add a layer to start.
                    </p>
                )}
            </Reorder.Group>
            <footer className="lp-footer">
                <DropdownMenu modal={false}>
                    <ButtonGroup className="lp-presets pattern-presets">
                        <DropdownMenuTrigger
                            disabled={!active}
                            render={
                                <Button className="lp-preset-label">
                                    <span>{presetLabel}</span>
                                </Button>
                            }
                        />
                        <DropdownMenuTrigger
                            disabled={!active}
                            render={
                                <Button
                                    size="icon"
                                    aria-label="Choose preset"
                                    className="lp-preset-arrow"
                                >
                                    <ChevronDown size={15} />
                                </Button>
                            }
                        />
                        <DropdownMenuContent
                            positionerClassName="z-[80]"
                            className="lp-preset-menu"
                        >
                            <DropdownMenuGroup>
                                {COMPONENT_PRESETS.map((p) => (
                                    <DropdownMenuItem
                                        key={p.label}
                                        onClick={() => {
                                            if (active)
                                                dispatch({
                                                    type: "edit",
                                                    id: active.id,
                                                    config: p.config,
                                                })
                                        }}
                                    >
                                        {p.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </ButtonGroup>
                </DropdownMenu>
                <button
                    type="button"
                    className="lp-button pattern-copy"
                    disabled={!stack.layers.length}
                    onClick={() => void copy()}
                >
                    <Copy size={14} />
                    Copy all layers
                </button>
                {onExport && (
                    <button
                        type="button"
                        className="lp-export"
                        onClick={onExport}
                    >
                        Export component HTML / CSS
                    </button>
                )}
            </footer>
            <span className="lp-sr-only" role="status">
                {announcement}
            </span>
        </div>
    )
}
