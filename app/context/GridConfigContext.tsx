// context/GridConfigContext.tsx
"use client"

import { createContext, useContext, useReducer, type ReactNode } from "react";
import { DEFAULT_PATTERN_CONFIG, type PatternConfig } from "../types/grid-config";


//Defining Action and State type
type Action =
    | { type: "UPDATE"; payload: Partial<PatternConfig> }
    | { type: "RESET" };

interface PatternConfigContextValue {
    config: PatternConfig;
    updateConfig: (partial: Partial<PatternConfig>) => void;
    resetConfig: () => void;
}


//initiating the Context with GridConfigContextValue Type
const PatternConfigContext = createContext<PatternConfigContextValue | null>(null);



//reducer function
function patternConfigReducer(state: PatternConfig, action: Action): PatternConfig {
    switch (action.type) {
        case "UPDATE":
            return { ...state, ...action.payload };
        case "RESET":
            return DEFAULT_PATTERN_CONFIG;
        default:
            return state;
    }
}


//Context Provider along with updateConfig function, it just provide dispatch feature for reducer update
export function PatternConfigProvider({ children }: { children: ReactNode }) {
    const [config, dispatch] = useReducer(patternConfigReducer, DEFAULT_PATTERN_CONFIG);

    const updateConfig = (partial: Partial<PatternConfig>) =>
        dispatch({ type: "UPDATE", payload: partial });

    const resetConfig = () => dispatch({ type: "RESET" });

    return (
        <PatternConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
            {children}
        </PatternConfigContext.Provider>
    );
}


//use context with provider error handling
export function useGridConfig() {
    const ctx = useContext(PatternConfigContext);
    if (!ctx) throw new Error("useGridConfig must be used within GridConfigProvider");
    return ctx;
}
