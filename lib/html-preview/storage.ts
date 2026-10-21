import { normalizeProject, type ComponentProject } from "./types"

const RECOVERY_KEY = "dotgrid:component-recovery:v1"
interface SavedRecord { project: ComponentProject; savedAt: number }
function record(value: unknown): SavedRecord | null {
    if (!value || typeof value !== "object") return null
    const entry = value as SavedRecord
    const project = normalizeProject(entry.project)
    return project && typeof entry.savedAt === "number" && Number.isFinite(entry.savedAt) ? { project, savedAt: entry.savedAt } : null
}
function recovery(): SavedRecord | null {
    try { return record(JSON.parse(localStorage.getItem(RECOVERY_KEY) || "null")) }
    catch { return null }
}
/** Synchronous last-chance snapshot: async IndexedDB work can be interrupted by page navigation. */
export function saveRecovery(project: ComponentProject) {
    try { localStorage.setItem(RECOVERY_KEY, JSON.stringify({ project, savedAt: Date.now() })) }
    catch { /* IndexedDB and downloads remain available when localStorage is full or blocked. */ }
}
function database(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("dotgrid-components", 1)
        request.onupgradeneeded = () => request.result.createObjectStore("workspace")
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}
export async function readProject(): Promise<ComponentProject | null> {
    const backup = recovery()
    let db: IDBDatabase
    try { db = await database() }
    catch (error) { if (backup) return backup.project; throw error }
    try {
        const saved = await new Promise<unknown>((resolve, reject) => {
            const request = db.transaction("workspace").objectStore("workspace").get("current")
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
        const primary = record(saved)
        if (backup && (!primary || backup.savedAt >= primary.savedAt)) return backup.project
        return primary?.project ?? normalizeProject(saved)
    } finally { db.close() }
}
export async function saveProject(project: ComponentProject): Promise<void> {
    const savedAt = Date.now()
    const db = await database()
    try {
        await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction("workspace", "readwrite")
            transaction.objectStore("workspace").put({ project, savedAt }, "current")
            transaction.oncomplete = () => resolve()
            transaction.onerror = () => reject(transaction.error)
            transaction.onabort = () => reject(transaction.error)
        })
        try {
            const backup = recovery()
            if (backup && backup.savedAt <= savedAt) localStorage.removeItem(RECOVERY_KEY)
        } catch { /* A committed IndexedDB save does not depend on recovery storage. */ }
    } finally { db.close() }
}
