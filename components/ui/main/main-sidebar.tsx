"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { MobilePatternDrawer } from "./mobile-pattern-drawer"
import { PatternControls } from "./pattern-controls"
import { Sidebar } from "../sidebar"

export function MainSidebar() {
    const isMobile = useIsMobile()

    if (isMobile) {
        return <MobilePatternDrawer><PatternControls /></MobilePatternDrawer>
    }

    return (
        <Sidebar className="flex flex-col justify-between rounded-4xl" variant="floating" collapsible="icon">
            <PatternControls />
        </Sidebar>
    )
}
