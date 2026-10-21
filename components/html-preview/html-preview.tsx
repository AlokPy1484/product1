"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { LayerStack } from "@/app/types/grid-config"
import type { PreparedDocument } from "@/lib/html-preview/build-document"
import type { PreviewTarget } from "@/lib/html-preview/types"

interface Props {
    document: PreparedDocument
    backgrounds: Record<string, LayerStack>
    selectedId: string | null
    selecting: boolean
    onTargets: (targets: PreviewTarget[]) => void
    onSelect: (target: PreviewTarget | null) => void
    onEscape: () => void
}
function isTarget(value: unknown): value is PreviewTarget {
    if (!value || typeof value !== "object") return false
    const v = value as PreviewTarget
    return typeof v.id === "string" && /^target-\d+$/.test(v.id) && typeof v.label === "string" && v.label.length < 10000 && (v.parentId === null || typeof v.parentId === "string") && Number.isFinite(v.width) && Number.isFinite(v.height) && typeof v.background === "string" && typeof v.inlineImportant === "boolean"
}
export function HtmlPreview(props: Props) {
    const iframe = useRef<HTMLIFrameElement>(null)
    const channel = useRef<MessageChannel | null>(null)
    const latest = useRef(props)
    const [ready, setReady] = useState(false)
    useEffect(() => { latest.current = props })
    const connect = useCallback(() => {
        if (!iframe.current?.contentWindow || channel.current) return
        const next = new MessageChannel()
        channel.current = next
        next.port1.onmessage = event => {
            const data = event.data
            const current = latest.current
            if (data?.type === "ready" && Array.isArray(data.targets) && data.targets.length <= 1000 && data.targets.every(isTarget)) {
                current.onTargets(data.targets)
                setReady(true)
                next.port1.postMessage({ type: "backgrounds", values: current.backgrounds })
                next.port1.postMessage({ type: "selection-mode", enabled: current.selecting })
                next.port1.postMessage({ type: "select", id: current.selectedId })
            }
            if ((data?.type === "selected" || data?.type === "geometry") && (data.target === null || isTarget(data.target))) current.onSelect(data.target)
            if (data?.type === "escape") current.onEscape()
        }
        next.port1.start()
        // An opaque sandbox has no addressable origin; the transferred port is the communication boundary.
        iframe.current.contentWindow.postMessage({ type: "dotgrid:connect", session: props.document.session }, "*", [next.port2])
    }, [props.document.session])
    useEffect(() => {
        const receive = (event: MessageEvent) => {
            if (event.source === iframe.current?.contentWindow && event.origin === "null" && event.data?.type === "dotgrid:ready" && event.data.session === props.document.session) connect()
        }
        window.addEventListener("message", receive)
        return () => {
            window.removeEventListener("message", receive)
            channel.current?.port1.close()
            channel.current?.port2.close()
            channel.current = null
        }
    }, [connect, props.document.session])
    useEffect(() => {
        if (!ready) return
        const frame = requestAnimationFrame(() => channel.current?.port1.postMessage({ type: "backgrounds", values: props.backgrounds }))
        return () => cancelAnimationFrame(frame)
    }, [props.backgrounds, ready])
    useEffect(() => { if (ready) channel.current?.port1.postMessage({ type: "select", id: props.selectedId }) }, [props.selectedId, ready])
    useEffect(() => { if (ready) channel.current?.port1.postMessage({ type: "selection-mode", enabled: props.selecting }) }, [props.selecting, ready])
    return <iframe ref={iframe} title="Component preview" sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={props.document.srcDoc} onLoad={connect} className="cw-frame" />
}
