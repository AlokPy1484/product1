"use client"
import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";


//initiating context type and context
type SelectorContextType = {
    selected: string,
    setSelected: Dispatch<SetStateAction<string>>
}

const SelectorContext = createContext<SelectorContextType | undefined>(undefined)


//context provider type and provider
type SelectorProviderProps = {
    children: React.ReactNode
}

export function SelectorProvider({ children, }: SelectorProviderProps) {
    const [selected, setSelected] = useState("Blank")

    return (
        <SelectorContext.Provider value={{ selected, setSelected }}>
            {children}
        </SelectorContext.Provider>
    )
}


//function to use the context
export function useSelector() {
    return useContext(SelectorContext)
}
