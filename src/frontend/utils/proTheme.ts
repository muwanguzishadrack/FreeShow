// Switch to the neutral Classic theme (and ProPresenter-like panel widths) when the ProPresenter layout is turned on.
// Applied once (and again whenever the layout is switched back on), so users can still pick another theme.

import { get } from "svelte/store"
import { resized, special, theme, themes } from "../stores"
import { updateThemeValues } from "./updateSettings"

const CLASSIC = "classic"

// ProPresenter's window: left column ~12%, right column ~27% (measured from a live capture);
// the left column is kept a bit wider here so FreeShow's lists stay readable
function applyPanelWidths() {
    const clamp = (value: number, min: number, max: number) => Math.round(Math.min(max, Math.max(min, value)))
    const width = window.innerWidth || 1512
    resized.update((a) => ({ ...a, leftPanel: clamp(width * 0.15, 200, 280), rightPanel: clamp(width * 0.27, 340, 520) }))
}

function applyClassic() {
    const classic = get(themes)[CLASSIC]
    if (!classic) return false

    theme.set(CLASSIC)
    updateThemeValues(classic)
    applyPanelWidths()
    special.update((a) => ({ ...a, proThemeApplied: true }))
    return true
}

export function startProThemeSync() {
    let previous: boolean | null = null

    const check = () => {
        const data = get(special)
        const proLayout = data.proLayout !== false

        // layout switched off: allow Classic to be applied again next time it is switched on
        if (!proLayout && data.proThemeApplied) {
            special.update((a) => {
                delete a.proThemeApplied
                return a
            })
        }

        const turnedOn = previous === false && proLayout
        previous = proLayout
        if (!proLayout) return
        if (data.proThemeApplied && !turnedOn) return

        applyClassic()
    }

    special.subscribe(check)
    // themes can load after settings
    themes.subscribe(() => {
        if (get(special).proLayout !== false && !get(special).proThemeApplied) applyClassic()
    })
}
