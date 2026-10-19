"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useGridConfig } from "@/app/context/GridConfigContext";
import type { PatternConfig } from "@/app/types/grid-config";
import { getLabelContrast } from "@/lib/color-contrast";
import { getLayerStackCSS } from "@/app/utils.ts/pattern-utils";

const TRANSITION_SECONDS = 0.16;

function publishLabelContrast(background: string) {
    const contrast = getLabelContrast(background);
    document.documentElement.style.setProperty("--pattern-label-color", contrast.color);
    document.documentElement.style.setProperty("--pattern-label-outline", contrast.outline);
}

function blendColor(from: string, to: string, progress: number): string {
    const start = parseInt(from.slice(1), 16);
    const end = parseInt(to.slice(1), 16);
    const channels = [16, 8, 0].map((shift) => {
        const a = (start >> shift) & 255;
        const b = (end >> shift) & 255;
        return Math.round(a + (b - a) * progress).toString(16).padStart(2, "0");
    });
    return `#${channels.join("")}`;
}

function blendConfig(from: PatternConfig, to: PatternConfig, progress: number): PatternConfig {
    const blend = (a: number, b: number) => a + (b - a) * progress;
    return {
        pattern: to.pattern,
        scale: blend(from.scale, to.scale),
        spacing: blend(from.spacing, to.spacing),
        opacity: blend(from.opacity, to.opacity),
        primaryRotation: blend(from.primaryRotation, to.primaryRotation),
        secondaryRotation: blend(from.secondaryRotation, to.secondaryRotation),
        primaryColour: blendColor(from.primaryColour, to.primaryColour, progress),
        backgroundColour: blendColor(from.backgroundColour, to.backgroundColour, progress),
    };
}

export function PatternBackground() {
    const { stack } = useGridConfig();
    const layers = stack.layers;
    const reduceMotion = useReducedMotion();
    const displayed = useRef(layers);
    const [frame, setFrame] = useState({ layers, previous: layers, progress: 1, crossfade: false });
    useEffect(() => {
        publishLabelContrast(displayed.current.find(layer => layer.backgroundEnabled)?.config.backgroundColour ?? "#ffffff");
        return () => {
            document.documentElement.style.removeProperty("--pattern-label-color");
            document.documentElement.style.removeProperty("--pattern-label-outline");
        };
    }, []);
    useEffect(() => {
        const from = displayed.current;
        const key = (items: typeof layers) => JSON.stringify(items.map(({ id, config, backgroundEnabled }) => ({ id, config, backgroundEnabled })));
        if (key(from) === key(layers)) return;
        const byId = new Map(from.map(layer => [layer.id, layer]));
        const crossfade = from.length !== layers.length || layers.some((layer, index) => from[index]?.id !== layer.id || byId.get(layer.id)?.config.pattern !== layer.config.pattern || byId.get(layer.id)?.backgroundEnabled !== layer.backgroundEnabled);
        const animation = animate(0, 1, {
            duration: reduceMotion ? 0 : TRANSITION_SECONDS, ease: "easeOut",
            onUpdate: progress => {
                const next = progress === 1 ? layers : layers.map(layer => ({ ...layer, config: blendConfig(byId.get(layer.id)?.config ?? layer.config, layer.config, progress) }));
                displayed.current = next;
                const background = (items: typeof layers) => items.find(layer => layer.backgroundEnabled)?.config.backgroundColour ?? "#ffffff";
                publishLabelContrast(crossfade ? blendColor(background(from), background(next), progress) : background(next));
                setFrame({ layers: next, previous: from, progress, crossfade });
            },
        });
        return () => animation.stop();
    }, [layers, reduceMotion]);
    const changing = frame.crossfade && frame.progress < 1;
    const css = (items: typeof layers) => ({ ...getLayerStackCSS({ layers: items, expandedLayerId: null, nextLayerNumber: 1 }), backgroundColor: "#ffffff" });
    return <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" data-pattern-background>
        {changing && <div className="absolute inset-0" style={css(frame.previous)} />}
        <div className="absolute inset-0" data-pattern-composite style={{ ...css(frame.layers), opacity: changing ? frame.progress : 1 }} />
    </div>;
}
