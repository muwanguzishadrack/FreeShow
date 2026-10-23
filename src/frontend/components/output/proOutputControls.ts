// ProPresenter-style output controls: Clear To Logo, Stage Only and Advance.

import { get } from "svelte/store"
import type { Outputs } from "../../../types/Output"
import { outLocked, outputs, special } from "../../stores"
import { imageExtensions } from "../../values/extensions"
import { getExtension } from "../helpers/media"
import { setOutput } from "../helpers/output"
import { clearAll, clearTimers } from "./clear"

// CLEAR TO LOGO

export function getLogoPath(): string {
    return get(special).proLogo || ""
}

export function clearToLogo() {
    if (get(outLocked)) return

    clearAll(true)

    const path = getLogoPath()
    if (!path) return

    const type = imageExtensions.includes(getExtension(path).toLowerCase()) ? "image" : "video"
    // wait for the clear to settle so the logo isn't cleared with it
    setTimeout(() => setOutput("background", { path, type, loop: true, muted: true }), 50)
}

// STAGE ONLY (slide is hidden on audience outputs, stage screens still show it)

export function isStageOnly(outputList: Outputs = get(outputs)) {
    return Object.values(outputList).some((output) => !output.stageOutput && output.slideStageOnly)
}

export function toggleStageOnly() {
    const value = !isStageOnly()

    outputs.update((a) => {
        Object.values(a).forEach((output) => {
            if (output.stageOutput) return
            if (value) output.slideStageOnly = true
            else delete output.slideStageOnly
        })
        return a
    })
}

// ADVANCE (automatic slide timers)

export function isAdvanceEnabled(specialData: any = get(special)) {
    return specialData.proAdvanceDisabled !== true
}

export function toggleAdvance() {
    const enable = !isAdvanceEnabled()

    special.update((a) => {
        if (enable) delete a.proAdvanceDisabled
        else a.proAdvanceDisabled = true
        return a
    })

    // stop any running slide timer right away
    if (!enable) clearTimers("", false)
}
