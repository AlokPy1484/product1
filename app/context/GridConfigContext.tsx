"use client";

import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import { DEFAULT_PATTERN_CONFIG, type PatternConfig } from "../types/grid-config";

const STORAGE_KEY = "dotgrid:pattern-config:v1";

type State = { config: PatternConfig; restored: boolean };
type Action =
    | { type: "UPDATE"; payload: Partial<PatternConfig> }
    | { type: "RESTORE"; payload: PatternConfig }
    | { type: "RESET" };

interface PatternConfigContextValue {
    config: PatternConfig;
    updateConfig: (partial: Partial<PatternConfig>) => void;
    resetConfig: () => void;
}

const PatternConfigContext = createContext<PatternConfigContextValue | null>(null);

function patternConfigReducer(state: State, action: Action): State {
    switch (action.type) {
        case "UPDATE":
            return { ...state, config: { ...state.config, ...action.payload } };
        case "RESTORE":
            return { config: action.payload, restored: true };
        case "RESET":
            return { ...state, config: DEFAULT_PATTERN_CONFIG };
    }
}

// Stored data can be stale or edited; restore only supported, valid values.
function readSavedConfig(): PatternConfig {
    try {
        const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
        if (!saved || typeof saved !== "object" || Array.isArray(saved)) return DEFAULT_PATTERN_CONFIG;
        const values = saved as Record<string, unknown>;
        const config = { ...DEFAULT_PATTERN_CONFIG };
        if (values.pattern === "dots" || values.pattern === "striped" || values.pattern === "grid") {
            config.pattern = values.pattern;
        }
        for (const key of ["primaryColour", "backgroundColour"] as const) {
            const value = values[key];
            if (typeof value === "string" && /^#[\da-f]{6}$/i.test(value)) config[key] = value;
        }
        const ranges = {
            scale: [0.1, 3], spacing: [10, 100], opacity: [0.1, 1],
            primaryRotation: [0, 180], secondaryRotation: [0, 180],
        } as const;
        for (const key of Object.keys(ranges) as (keyof typeof ranges)[]) {
            const value = values[key];
            const [min, max] = ranges[key];
            if (typeof value === "number" && Number.isFinite(value) && value >= min && value <= max) {
                config[key] = value;
            }
        }
        return config;
    } catch {
        return DEFAULT_PATTERN_CONFIG;
    }
}

export function PatternConfigProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(patternConfigReducer, {
        config: DEFAULT_PATTERN_CONFIG,
        restored: false,
    });

    // Keep the server and first client render identical, then restore browser settings.
    useEffect(() => {
        dispatch({ type: "RESTORE", payload: readSavedConfig() });
    }, []);

    useEffect(() => {
        if (!state.restored) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.config));
        } catch {
            // Storage restrictions must not prevent editing or exporting patterns.
        }
    }, [state.config, state.restored]);

    const updateConfig = (partial: Partial<PatternConfig>) => dispatch({ type: "UPDATE", payload: partial });
    const resetConfig = () => dispatch({ type: "RESET" });

    return (
        <PatternConfigContext.Provider value={{ config: state.config, updateConfig, resetConfig }}>
            {children}
        </PatternConfigContext.Provider>
    );
}

export function useGridConfig() {
    const ctx = useContext(PatternConfigContext);
    if (!ctx) throw new Error("useGridConfig must be used within PatternConfigProvider");
    return ctx;
}
