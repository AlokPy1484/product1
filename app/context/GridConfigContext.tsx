"use client"

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useReducer,
    type ReactNode,
} from "react"
import {
    DEFAULT_PATTERN_CONFIG,
    type LayerStack,
    type PatternConfig,
} from "../types/grid-config"
import {
    createStack,
    normalizeStack,
    updateStack,
    validPatternConfig,
    type StackAction,
} from "@/lib/pattern-layers"

const STORAGE_KEY = "dotgrid:pattern-layers:v2"
interface ContextValue {
    stack: LayerStack
    restored: boolean
    setStack: (stack: LayerStack) => void
    dispatchStack: (action: StackAction) => void
    resetDesign: () => void
    config: PatternConfig
    updateConfig: (partial: Partial<PatternConfig>) => void
    resetConfig: () => void
}
const Context = createContext<ContextValue | null>(null)
type State = { stack: LayerStack; restored: boolean }
function reducer(
    state: State,
    action:
        | { type: "restore" | "set"; stack: LayerStack }
        | { type: "action"; action: StackAction },
): State {
    if (action.type === "action")
        return { ...state, stack: updateStack(state.stack, action.action) }
    return {
        stack: action.stack,
        restored: action.type === "restore" || state.restored,
    }
}
function savedStack() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")
        const stack = saved?.version === 2 && normalizeStack(saved.stack)
        if (stack) return stack
    } catch {
        /* Try the original single pattern. */
    }
    try {
        const legacy = JSON.parse(
            localStorage.getItem("dotgrid:pattern-config:v1") || "null",
        )
        if (validPatternConfig(legacy)) return createStack(legacy)
    } catch {
        /* Editing works without storage. */
    }
    return createStack()
}
export function PatternConfigProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, {
        stack: createStack(),
        restored: false,
    })
    useEffect(() => {
        dispatch({ type: "restore", stack: savedStack() })
    }, [])
    useEffect(() => {
        if (state.restored)
            try {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({ version: 2, stack: state.stack }),
                )
            } catch {
                /* Export stays available. */
            }
    }, [state])
    const setStack = useCallback(
        (stack: LayerStack) => dispatch({ type: "set", stack }),
        [],
    )
    const dispatchStack = useCallback(
        (action: StackAction) => dispatch({ type: "action", action }),
        [],
    )
    const resetDesign = useCallback(
        () => dispatch({ type: "set", stack: createStack() }),
        [],
    )
    const active =
        state.stack.layers.find((l) => l.id === state.stack.expandedLayerId) ??
        state.stack.layers[0]
    const config = active?.config ?? DEFAULT_PATTERN_CONFIG
    const updateConfig = (partial: Partial<PatternConfig>) => {
        if (active)
            dispatchStack({ type: "edit", id: active.id, config: partial })
    }
    return (
        <Context.Provider
            value={{
                ...state,
                setStack,
                dispatchStack,
                resetDesign,
                config,
                updateConfig,
                resetConfig: resetDesign,
            }}
        >
            {children}
        </Context.Provider>
    )
}
export function useGridConfig() {
    const context = useContext(Context)
    if (!context)
        throw new Error(
            "useGridConfig must be used within PatternConfigProvider",
        )
    return context
}
