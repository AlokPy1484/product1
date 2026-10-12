"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useGridConfig } from "@/app/context/GridConfigContext";
import type { PatternConfig } from "@/app/types/grid-config";
import { getLabelContrast } from "@/lib/color-contrast";
import { getPatternCSS } from "@/app/utils.ts/pattern-utils";

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
    const { config } = useGridConfig();
    const reduceMotion = useReducedMotion();
    const displayedConfig = useRef(config);
    const [frame, setFrame] = useState({ config, previousPattern: config.pattern, progress: 1 });

    useEffect(() => {
        const root = document.documentElement;
        const previousColor = root.style.getPropertyValue("--pattern-label-color");
        const previousOutline = root.style.getPropertyValue("--pattern-label-outline");
        publishLabelContrast(displayedConfig.current.backgroundColour);
        return () => {
            if (previousColor) root.style.setProperty("--pattern-label-color", previousColor);
            else root.style.removeProperty("--pattern-label-color");
            if (previousOutline) root.style.setProperty("--pattern-label-outline", previousOutline);
            else root.style.removeProperty("--pattern-label-outline");
        };
    }, []);

    useEffect(() => {
        const from = displayedConfig.current;
        if (JSON.stringify(from) === JSON.stringify(config)) return;

        // Interrupted slider changes start from the visible values, keeping
        // rapid dragging smooth without queuing animations or extra layers.
        const animation = animate(0, 1, {
            duration: reduceMotion ? 0 : TRANSITION_SECONDS,
            ease: "easeOut",
            onUpdate: (progress) => {
                const next = progress === 1 ? config : blendConfig(from, config, progress);
                displayedConfig.current = next;
                publishLabelContrast(next.backgroundColour);
                setFrame({ config: next, previousPattern: from.pattern, progress });
            },
        });
        return () => animation.stop();
    }, [config, reduceMotion]);

    const changingPattern = frame.previousPattern !== frame.config.pattern && frame.progress < 1;

    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" data-pattern-background>
            {/* Keep the outgoing pattern opaque below the incoming layer so
                a pattern switch never flashes the page's base color. */}
            {changingPattern && (
                <div
                    className="absolute inset-0"
                    style={getPatternCSS({ ...frame.config, pattern: frame.previousPattern })}
                />
            )}
            <div
                className="absolute inset-0"
                style={{ ...getPatternCSS(frame.config), opacity: changingPattern ? frame.progress : 1 }}
            />
        </div>
    );
}
