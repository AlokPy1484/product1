"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "../button"
import { Drawer, DrawerContent, DrawerBody, DrawerDescription, DrawerTitle } from "../drawer"

import { END_WALKTHROUGH_EVENT, REQUEST_MOBILE_WALKTHROUGH_EVENT, START_WALKTHROUGH_EVENT } from "@/lib/walkthrough"

const PEEK_HEIGHT = 40
const EXPANDED_POINT = 0.8

export function MobilePatternDrawer({ children }: { children: ReactNode }) {
    const [expanded, setExpanded] = useState(false)
    const [tourRequest, setTourRequest] = useState(0)
    const [tourActive, setTourActive] = useState(false)
    const handledTourRequest = useRef(0)
    const [peekHeight, setPeekHeight] = useState(PEEK_HEIGHT)
    const popupRef = useRef<HTMLDivElement | null>(null)
    const handleButtonRef = useRef<HTMLButtonElement | null>(null)
    const dismissSwipeEvent = useRef<Event | null>(null)
    const handlePointer = useRef<number | null>(null)
    const pointerStart = useRef(0)
    const dragged = useRef(false)
    const snapPoints = useMemo(() => [peekHeight, EXPANDED_POINT], [peekHeight])

    const measureSafeArea = useCallback(() => {
        if (!popupRef.current) return
        const inset = parseFloat(getComputedStyle(popupRef.current).paddingBottom) || 0
        setPeekHeight(PEEK_HEIGHT + inset)
    }, [])
    const setPopupRef = useCallback((element: HTMLDivElement | null) => {
        popupRef.current = element
        if (element) measureSafeArea()
    }, [measureSafeArea])

    useEffect(() => {
        window.addEventListener("resize", measureSafeArea)
        return () => window.removeEventListener("resize", measureSafeArea)
    }, [measureSafeArea])

    useEffect(() => {
        const requestTour = () => {
            setExpanded(true)
            setTourRequest((value) => value + 1)
        }
        const finishTour = () => setTourActive(false)
        window.addEventListener(REQUEST_MOBILE_WALKTHROUGH_EVENT, requestTour)
        window.addEventListener(END_WALKTHROUGH_EVENT, finishTour)
        return () => {
            window.removeEventListener(REQUEST_MOBILE_WALKTHROUGH_EVENT, requestTour)
            window.removeEventListener(END_WALKTHROUGH_EVENT, finishTour)
        }
    }, [])

    useEffect(() => {
        if (!expanded || tourRequest <= handledTourRequest.current) return
        let cancelled = false
        // Wait for the actual drawer transition, including reduced-motion cases.
        const frame = requestAnimationFrame(() => {
            const animations = popupRef.current?.getAnimations() ?? []
            Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
                if (cancelled) return
                handledTourRequest.current = tourRequest
                setTourActive(true)
                // Driver renders outside the drawer portal; allow its own
                // overlay and focus handling to take over before it starts.
            })
        })
        return () => {
            cancelled = true
            cancelAnimationFrame(frame)
        }
    }, [expanded, tourRequest])

    useEffect(() => {
        if (!tourActive) return
        const frame = requestAnimationFrame(() => window.dispatchEvent(new Event(START_WALKTHROUGH_EVENT)))
        return () => cancelAnimationFrame(frame)
    }, [tourActive])

    const collapse = () => {
        handleButtonRef.current?.focus({ preventScroll: true })
        setExpanded(false)
    }

    return (
        <Drawer
            open
            modal={expanded && !tourActive}
            disablePointerDismissal={!expanded || tourActive}
            snapPoints={snapPoints}
            snapPoint={expanded ? EXPANDED_POINT : peekHeight}
            snapToSequentialPoints
            onSnapPointChange={(point, details) => {
                // A swipe beyond the lowest stop is a collapse, never an
                // unmount. Ignore Base UI's restoration of that same gesture.
                if (point === null) {
                    dismissSwipeEvent.current = details.event
                    setExpanded(false)
                } else if (dismissSwipeEvent.current === details.event) {
                    dismissSwipeEvent.current = null
                } else {
                    setExpanded(point === EXPANDED_POINT)
                }
            }}
            onOpenChange={(open, details) => {
                if (!open) {
                    details.cancel()
                    collapse()
                }
            }}
        >
            <DrawerContent
                ref={setPopupRef}
                showOverlay={expanded && !tourActive}
                initialFocus={false}
                data-mobile-pattern-drawer
                data-collapsed={!expanded ? "" : undefined}
                className="inset-x-[2px] min-[360px]:inset-x-1 h-[min(80dvh,46rem)] max-h-[calc(100dvh-1rem)] pb-[env(safe-area-inset-bottom)] md:hidden"
                onPointerMove={(event) => {
                    if (handlePointer.current === event.pointerId && Math.abs(event.clientY - pointerStart.current) > 6) {
                        dragged.current = true
                    }
                }}
                onPointerUp={(event) => {
                    // Base UI captures pointers on the popup, so release must
                    // be tracked here even when the press started on the grip.
                    if (handlePointer.current === event.pointerId && !dragged.current) {
                        queueMicrotask(() => setExpanded(!expanded))
                    }
                    handlePointer.current = null
                }}
                onPointerCancel={() => { handlePointer.current = null }}
            >
                <div
                    className="relative flex h-12 shrink-0 touch-pan-x items-center justify-center rounded-t-4xl has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-neutral-400"
                    data-drawer-handle
                    onPointerDown={(event) => {
                        handlePointer.current = (event.target as HTMLElement).closest("button") ? null : event.pointerId
                        pointerStart.current = event.clientY
                        dragged.current = false
                    }}
                >
                    <span aria-hidden="true" className="pointer-events-none h-1 w-10 rounded-full bg-neutral-500" />
                    <button
                        ref={handleButtonRef}
                        type="button"
                        className="pointer-events-none sr-only"
                        aria-label={expanded ? "Collapse pattern controls" : "Expand pattern controls"}
                        aria-expanded={expanded}
                        aria-controls="mobile-pattern-controls"
                        onClick={(event) => {
                            event.stopPropagation()
                            setExpanded((value) => !value)
                        }}
                    />
                    {expanded && (
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Close pattern controls"
                            className="absolute top-1 right-3 size-11 rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
                            onClick={(event) => {
                                event.stopPropagation()
                                collapse()
                            }}
                        >
                            <X className="size-4" />
                        </Button>
                    )}
                </div>
                <DrawerTitle className="sr-only">Pattern controls</DrawerTitle>
                <DrawerDescription className="sr-only">Pull up to customize your pattern. Swipe down to collapse.</DrawerDescription>
                <DrawerBody id="mobile-pattern-controls" inert={!expanded} aria-hidden={!expanded} className="[&_button]:min-h-11">
                    {children}
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    )
}
