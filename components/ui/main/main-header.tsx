"use client"

import { ComponentUpload } from "@/components/html-preview/component-upload"
import { useGridConfig } from "@/app/context/GridConfigContext"
import { BookOpenText, RotateCcw } from "lucide-react"
import { Button } from "../button"
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "../avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip"
import { REQUEST_MOBILE_WALKTHROUGH_EVENT, START_WALKTHROUGH_EVENT } from "@/lib/walkthrough"

export function MainHeader() {
    const { resetDesign } = useGridConfig()
    const openWalkthrough = () => {
        const event = window.matchMedia("(max-width: 767px)").matches
            ? REQUEST_MOBILE_WALKTHROUGH_EVENT
            : START_WALKTHROUGH_EVENT
        window.dispatchEvent(new Event(event))
    }

    return (
        <header className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-20 h-12 md:top-4" data-main-header>
            <span
                data-brand-label
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-bold font-sans max-[496px]:left-[calc(100%-15.5rem)] md:left-[max(50%,26rem)] md:text-base"
                style={{
                    color: "var(--pattern-label-color, #000000)",
                    WebkitTextStroke: "0.4px var(--pattern-label-outline, #ffffff)",
                    paintOrder: "stroke fill",
                }}
            >
                dotgrid.io
            </span>
            <div data-header-actions className="pointer-events-auto absolute top-0 right-[max(0.5rem,env(safe-area-inset-right))] flex items-center gap-2 rounded-4xl bg-neutral-900 px-2 py-1 md:right-4 md:gap-4 md:px-4 md:py-2">
                <Button
                    className="size-10 cursor-pointer bg-transparent p-0 hover:bg-neutral-800 md:h-8 md:w-4"
                    aria-label="Open walkthrough"
                    onClick={openWalkthrough}
                >
                    <BookOpenText className="text-neutral-100" strokeWidth={1.5} size={16} />
                </Button>
                <Tooltip>
                    <TooltipTrigger render={<button type="button" aria-label="Reset design" onClick={resetDesign} className="flex size-10 items-center justify-center rounded-full text-neutral-100 outline-none hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-400 md:size-8"><RotateCcw size={16} strokeWidth={1.5} /></button>} />
                    <TooltipContent>Reset design</TooltipContent>
                </Tooltip>
                <ComponentUpload />
                <Tooltip>
                    <TooltipTrigger render={
                        <button type="button" aria-label="User profile" className="flex size-10 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 md:size-6">
                            <Avatar size="sm" className="relative">
                                <AvatarImage src="https://github.com/shadcn.png" alt="" />
                                <AvatarFallback>CN</AvatarFallback>
                                <AvatarBadge className="bg-green-600 dark:bg-green-800" />
                                <span className="absolute -top-1 z-10 h-[130%] w-[130%] rounded-full opacity-0 backdrop-blur-xs transition-opacity duration-300 hover:opacity-100" />
                            </Avatar>
                        </button>
                    } />
                    <TooltipContent className="mt-3">User Profile is coming soon</TooltipContent>
                </Tooltip>
            </div>
        </header>
    )
}
