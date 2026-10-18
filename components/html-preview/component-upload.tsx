"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Upload } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const ComponentWorkspace = dynamic(() => import("./component-workspace"), { ssr: false })

export function ComponentUpload() {
    const [opened, setOpened] = useState(false)
    const [loaded, setLoaded] = useState(false)
    return <>
        <Tooltip>
            <TooltipTrigger render={<button type="button" aria-label="Upload component" aria-haspopup="dialog" className="flex size-10 items-center justify-center rounded-full bg-transparent text-neutral-100 outline-none hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-400 md:size-8" onClick={() => { setLoaded(true); setOpened(true) }}><Upload size={16} strokeWidth={1.5} /></button>} />
            <TooltipContent>Upload component</TooltipContent>
        </Tooltip>
        {loaded && <ComponentWorkspace open={opened} onClose={() => setOpened(false)} />}
    </>
}
