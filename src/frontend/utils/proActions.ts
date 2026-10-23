// Shared actions for the ProPresenter-style toolbar and keyboard shortcuts.

import { get } from "svelte/store"
import type { DrawerTabIds } from "../../types/Tabs"
import { proCenterView, proToolsTab } from "../components/show/proToolsState"
import { activeDrawerTab, activeEdit, activePage, activeShow, drawer, drawerOpenedInEdit, editMode } from "../stores"
import { DEFAULT_DRAWER_HEIGHT } from "./common"

export type ProToolTab = "groups" | "audio" | "props" | "timers" | "macros"

// the bin is only visibly open on the Show page, or in Edit when the user expanded it there
export function isBinVisible() {
    const page = get(activePage)
    return get(drawer).height > 40 && (page === "show" || (page === "edit" && get(drawerOpenedInEdit)))
}

// bin content (Media; Themes until it gets its own picker). Clicking the open one again collapses it.
export function toggleBin(tab: DrawerTabIds) {
    if (get(activePage) !== "show" && get(activePage) !== "edit") activePage.set("show")

    if (isBinVisible() && get(activeDrawerTab) === tab) {
        drawer.set({ height: 40, stored: get(drawer).height })
        return
    }

    activeDrawerTab.set(tab)
    if (get(drawer).height <= 40) drawer.set({ height: get(drawer).stored ?? DEFAULT_DRAWER_HEIGHT, stored: null })
}

// Audio, Props, Timers and Macros live in the right tools panel, like ProPresenter
export function openTool(tab: ProToolTab) {
    if (get(activePage) !== "show") activePage.set("show")
    proCenterView.set("slides")
    proToolsTab.set(tab)
}

// Bible takes over the centre area; clicking again (or Show) returns to the slides
export function toggleBible() {
    const isOpen = get(activePage) === "show" && get(proCenterView) === "bible"
    activePage.set("show")
    proCenterView.set(isOpen ? "slides" : "bible")
}

export function showSlides() {
    activePage.set("show")
    proCenterView.set("slides")
}

export function openEditor(mode: "default" | "text_edit") {
    const show = get(activeShow)
    if (!show || (show.type || "show") !== "show") return
    editMode.set(mode)
    activePage.set("edit")
    activeEdit.set({ slide: get(activeEdit).slide || 0, items: [], showId: show.id })
}
