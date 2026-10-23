import { writable } from "svelte/store"

// selected tab of the ProPresenter-style tools panel
export const proToolsTab = writable("groups")

// what the centre area shows on the Show page in the ProPresenter layout
export const proCenterView = writable<"slides" | "bible">("slides")
