"use client"

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"
import { cn } from "@/lib/utils"

// shadcn Base UI composition, tailored to the bottom controls panel.
function Drawer(props: DrawerPrimitive.Root.Props) {
    return <DrawerPrimitive.Root swipeDirection="down" {...props} />
}

function DrawerTrigger(props: DrawerPrimitive.Trigger.Props) {
    return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerClose(props: DrawerPrimitive.Close.Props) {
    return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerSwipeArea(props: DrawerPrimitive.SwipeArea.Props) {
    return <DrawerPrimitive.SwipeArea data-slot="drawer-swipe-area" {...props} />
}

function DrawerContent({ className, children, showOverlay = true, ...props }: DrawerPrimitive.Popup.Props & { showOverlay?: boolean }) {
    return (
        <DrawerPrimitive.Portal>
            {showOverlay && <DrawerPrimitive.Backdrop
                data-slot="drawer-overlay"
                className="pattern-drawer-overlay fixed inset-0 z-40 bg-black/5 supports-[-webkit-touch-callout:none]:absolute"
            />}
            <DrawerPrimitive.Viewport className="pointer-events-none fixed inset-0 z-40">
                <DrawerPrimitive.Popup
                    data-slot="drawer-popup"
                    className={cn("pattern-drawer-popup pointer-events-auto fixed inset-x-0 bottom-0 flex min-h-0 flex-col rounded-t-4xl bg-neutral-900 text-neutral-100 shadow-2xl outline-none", className)}
                    {...props}
                >
                    {children}
                </DrawerPrimitive.Popup>
            </DrawerPrimitive.Viewport>
        </DrawerPrimitive.Portal>
    )
}

function DrawerBody({ className, ...props }: DrawerPrimitive.Content.Props) {
    return <DrawerPrimitive.Content data-slot="drawer-content" className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)} {...props} />
}

function DrawerTitle(props: DrawerPrimitive.Title.Props) {
    return <DrawerPrimitive.Title data-slot="drawer-title" {...props} />
}

function DrawerDescription(props: DrawerPrimitive.Description.Props) {
    return <DrawerPrimitive.Description data-slot="drawer-description" {...props} />
}

export { Drawer, DrawerTrigger, DrawerClose, DrawerSwipeArea, DrawerContent, DrawerBody, DrawerTitle, DrawerDescription }
