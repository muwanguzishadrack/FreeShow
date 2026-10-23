// Audience Looks: store glue. Looks are saved in settings (special.proLooks); the active look is
// copied onto each audience output (outputs[id].proLook) so output windows render it.

import { get } from "svelte/store"
import { uid } from "uid"
import { outputs, special } from "../../stores"
import { applyLookToOutputs, createLook, type AudienceLook, type AudienceLooks } from "../../utils/audienceLooks"

export function getLooks(): AudienceLooks {
    return get(special).proLooks || {}
}

export function getActiveLookId(): string | null {
    const id = get(special).proActiveLook || null
    return id && getLooks()[id] ? id : null
}

function syncOutputs() {
    const lookId = getActiveLookId()
    const look = lookId ? getLooks()[lookId] : null
    const updated = applyLookToOutputs(get(outputs), lookId, look)
    if (updated) outputs.set(updated)
}

export function activateLook(lookId: string | null) {
    special.update((a) => {
        if (lookId) a.proActiveLook = lookId
        else delete a.proActiveLook
        return a
    })
    syncOutputs()
}

export function addLook(name: string): string {
    const id = uid()
    const look = createLook(name, get(outputs))
    special.update((a) => ({ ...a, proLooks: { ...(a.proLooks || {}), [id]: look } }))
    return id
}

export function updateLook(lookId: string, look: AudienceLook) {
    special.update((a) => ({ ...a, proLooks: { ...(a.proLooks || {}), [lookId]: look } }))
    syncOutputs()
}

export function deleteLook(lookId: string) {
    special.update((a) => {
        const looks = { ...(a.proLooks || {}) }
        delete looks[lookId]
        a.proLooks = looks
        if (a.proActiveLook === lookId) delete a.proActiveLook
        return a
    })
    syncOutputs()
}

// keep outputs in line with the active look (edits, new screens, settings loaded after start)
let timeout: ReturnType<typeof setTimeout> | null = null
export function startAudienceLookSync() {
    const schedule = () => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(syncOutputs, 200)
    }
    special.subscribe(schedule)
    outputs.subscribe(schedule)
}
