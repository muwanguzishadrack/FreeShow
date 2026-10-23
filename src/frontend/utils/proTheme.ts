// Switch to the neutral Classic theme when the ProPresenter layout is turned on.
// Applied once (and again whenever the layout is switched back on), so users can still pick another theme.

import { get } from "svelte/store"
import { special, theme, themes } from "../stores"
import { updateThemeValues } from "./updateSettings"

const CLASSIC = "classic"

function applyClassic() {
    const classic = get(themes)[CLASSIC]
    if (!classic) return false

    theme.set(CLASSIC)
    updateThemeValues(classic)
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
