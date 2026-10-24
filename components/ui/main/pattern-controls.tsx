"use client"

import { useEffect, useRef } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import { useGridConfig } from "@/app/context/GridConfigContext"
import { LayerPanel } from "@/components/layers/layer-panel"
import {
    END_WALKTHROUGH_EVENT,
    START_WALKTHROUGH_EVENT,
} from "@/lib/walkthrough"

export function PatternControls() {
    const { stack, setStack, dispatchStack, restored } = useGridConfig()
    const current = useRef(stack)
    useEffect(() => {
        current.current = stack
    }, [stack])
    useEffect(() => {
        let frame = 0
        const guide = driver({
            showProgress: true,
            onDestroyed: () =>
                window.dispatchEvent(new Event(END_WALKTHROUGH_EVENT)),
            steps: [
                {
                    element: ".layer-add",
                    popover: {
                        title: "Pattern layers",
                        description:
                            "Add independent dots, stripes, and grids. The top row is drawn on top.",
                    },
                },
                {
                    element: ".lp-toggle",
                    popover: {
                        title: "Layer controls",
                        description:
                            "Expand a layer to edit it. Collapsing keeps its pattern visible.",
                    },
                },
                {
                    element: ".lp-grip",
                    popover: {
                        title: "Reorder",
                        description:
                            "Drag only the grip, or focus it and use Up and Down. Sliders never reorder layers.",
                    },
                },
                {
                    element: ".pattern-toggle",
                    popover: {
                        title: "Pattern type",
                        description:
                            "Choose a pattern for this layer. Reset layer affects only this layer.",
                    },
                },
                {
                    element: ".pattern-control",
                    popover: {
                        title: "Geometry",
                        description:
                            "Adjust this layer’s scale, spacing, opacity, and rotations.",
                    },
                },
                {
                    element: ".pattern-color",
                    popover: {
                        title: "Colors",
                        description:
                            "New layers have transparent backgrounds so lower layers show through.",
                    },
                },
                {
                    element: ".pattern-presets",
                    popover: {
                        title: "Presets",
                        description: "Apply a preset to the expanded layer.",
                    },
                },
                {
                    element: ".pattern-copy",
                    popover: {
                        title: "Copy all layers",
                        description:
                            "Export the complete stack in the same order as the preview.",
                    },
                },
            ],
        })
        const start = () => {
            if (!current.current.layers.length)
                dispatchStack({ type: "add", id: crypto.randomUUID() })
            else if (!current.current.expandedLayerId)
                dispatchStack({
                    type: "toggle",
                    id: current.current.layers[0].id,
                })
            cancelAnimationFrame(frame)
            frame = requestAnimationFrame(() => guide.drive())
        }
        window.addEventListener(START_WALKTHROUGH_EVENT, start)
        return () => {
            window.removeEventListener(START_WALKTHROUGH_EVENT, start)
            cancelAnimationFrame(frame)
            guide.destroy()
        }
    }, [dispatchStack])
    useEffect(() => {
        if (!restored || !matchMedia("(min-width:768px)").matches) return
        try {
            if (!localStorage.getItem("hasVisited")) {
                localStorage.setItem("hasVisited", "true")
                window.dispatchEvent(new Event(START_WALKTHROUGH_EVENT))
            }
        } catch {
            /* Walkthrough is optional. */
        }
    }, [restored])
    return <LayerPanel stack={stack} onChange={setStack} scope="home" />
}
