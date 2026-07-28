// context/GridConfigContext.tsx
"use client"

import { createContext, useContext, useReducer, type ReactNode } from "react";
import { DEFAULT_GRID_CONFIG, type GridConfig } from "../types/grid-config";

type Action =
    | { type: "UPDATE"; payload: Partial<GridConfig> }
    | { type: "RESET" };

interface GridConfigContextValue {
    config: GridConfig;
    updateConfig: (partial: Partial<GridConfig>) => void;
    resetConfig: () => void;
}

const GridConfigContext = createContext<GridConfigContextValue | null>(null);



function gridConfigReducer(state: GridConfig, action: Action): GridConfig {
    switch (action.type) {
        case "UPDATE":
            return { ...state, ...action.payload };
        case "RESET":
            return DEFAULT_GRID_CONFIG;
        default:
            return state;
    }
}

export function GridConfigProvider({ children }: { children: ReactNode }) {
    const [config, dispatch] = useReducer(gridConfigReducer, DEFAULT_GRID_CONFIG);

    const updateConfig = (partial: Partial<GridConfig>) =>
        dispatch({ type: "UPDATE", payload: partial });

    const resetConfig = () => dispatch({ type: "RESET" });

    return (
        <GridConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
            {children}
        </GridConfigContext.Provider>
    );
}

export function useGridConfig() {
    const ctx = useContext(GridConfigContext);
    if (!ctx) throw new Error("useGridConfig must be used within GridConfigProvider");
    return ctx;
}
