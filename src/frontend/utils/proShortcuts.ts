// ProPresenter-style keyboard shortcuts, active when the "ProPresenter layout" setting is on.
// Key choices come from ProPresenter 21.2's own menus (MainMenu.nib and the live menu bar).

import { get } from "svelte/store"
import type { DrawerTabIds } from "../../types/Tabs"
import { clearToLogo } from "../components/output/proOutputControls"
import { activeDrawerTab, activeEdit, activePage, activeShow, drawer, editMode, os, special } from "../stores"
import { DEFAULT_DRAWER_HEIGHT } from "./common"
import { previewShortcuts } from "./shortcuts"

const isProLayout = () => get(special).proLayout !== false

// Presentation clear keys: ProPresenter uses F2 slide, F3 media, F4 props, F5 audio, F12 clear to logo.
// FreeShow's own handlers do the work; only the keys change.
const proPreviewKeys: { [key: string]: () => any } = {
    F2: () => previewShortcuts.F2(),
    F3: () => previewShortcuts.F1(),
    F4: () => previewShortcuts.F3(),
    F5: () => previewShortcuts.F4(),
    F12: () => clearToLogo()
}

export function getPreviewShortcut(key: string): ((e: any) => any) | undefined {
    if (isProLayout()) {
        if (proPreviewKeys[key]) return proPreviewKeys[key]
        // F1 has no ProPresenter meaning; keep FreeShow's other keys (Escape, arrows, space...)
    }
    return previewShortcuts[key]
}

// View shortcuts (macOS only: Control+letter, so Windows copy/paste keys are untouched)

function openDrawer(tab: DrawerTabIds) {
    if (get(activePage) !== "show" && get(activePage) !== "edit") activePage.set("show")
    activeDrawerTab.set(tab)
    if (get(drawer).height <= 40) drawer.set({ height: get(drawer).stored ?? DEFAULT_DRAWER_HEIGHT, stored: null })
}

function openEditor(mode: "default" | "text_edit") {
    const show = get(activeShow)
    if (!show || (show.type || "show") !== "show") return
    editMode.set(mode)
    activePage.set("edit")
    activeEdit.set({ slide: get(activeEdit).slide || 0, items: [], showId: show.id })
}

const controlKeys: { [code: string]: () => void } = {
    KeyS: () => activePage.set("show"),
    KeyE: () => openEditor("default"),
    KeyR: () => openEditor("text_edit"),
    KeyB: () => openDrawer("scripture"),
    KeyV: () => openDrawer("media"),
    KeyA: () => openDrawer("audio"),
    KeyP: () => openDrawer("overlays")
}
const controlShiftKeys: { [code: string]: () => void } = {
    KeyM: () => openDrawer("functions")
}

// returns true when the key was handled
export function handleProShortcut(e: KeyboardEvent): boolean {
    if (!isProLayout() || get(os).platform !== "darwin") return false

    // Shift+Command+S: Stage
    if (e.metaKey && e.shiftKey && !e.ctrlKey && !e.altKey && e.code === "KeyS") {
        e.preventDefault()
        activePage.set("stage")
        return true
    }

    if (!e.ctrlKey || e.metaKey || e.altKey) return false

    const handler = e.shiftKey ? controlShiftKeys[e.code] : controlKeys[e.code]
    if (!handler) return false

    e.preventDefault()
    handler()
    return true
}
