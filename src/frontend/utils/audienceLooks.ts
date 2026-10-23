// Audience Looks: named looks that decide, per audience screen, which layers and props are shown
// and (optionally) which output style is used. Pure functions only, so they can be unit tested.

import type { Output, OutputLook, Outputs } from "../../types/Output"

export const LOOK_LAYERS = ["background", "slide", "overlays"] as const
export type LookLayer = (typeof LOOK_LAYERS)[number]

export interface LookScreen {
    style?: string // output style to use instead of the screen's own (theme, template)
    layers: string[]
    hiddenProps: string[] // overlay ids hidden on this screen
}
export interface AudienceLook {
    name: string
    screens: { [outputId: string]: LookScreen }
}
export type AudienceLooks = { [lookId: string]: AudienceLook }

export function isAudienceOutput(output: Output | undefined) {
    return !!output && !output.stageOutput
}

export function getAudienceOutputIds(outputs: Outputs) {
    return Object.keys(outputs).filter((id) => isAudienceOutput(outputs[id]))
}

export function getDefaultLookScreen(): LookScreen {
    return { layers: [...LOOK_LAYERS], hiddenProps: [] }
}

export function createLook(name: string, outputs: Outputs): AudienceLook {
    const screens: AudienceLook["screens"] = {}
    getAudienceOutputIds(outputs).forEach((id) => {
        screens[id] = getDefaultLookScreen()
    })
    return { name, screens }
}

function toOutputLook(lookId: string, screen: LookScreen): OutputLook {
    const look: OutputLook = { id: lookId, layers: [...screen.layers], hiddenProps: [...screen.hiddenProps] }
    if (screen.style) look.style = screen.style
    return look
}

// Returns outputs with the look applied to every audience screen (null = Default: no look).
// Screens the look doesn't configure are left without a look. Stage screens are never touched.
// Returns null when nothing changed, so callers can skip store updates.
export function applyLookToOutputs(outputs: Outputs, lookId: string | null, look: AudienceLook | null): Outputs | null {
    let changed = false
    const result: Outputs = { ...outputs }

    getAudienceOutputIds(outputs).forEach((id) => {
        const screen = lookId && look ? look.screens[id] : undefined
        const current = outputs[id].proLook
        const next = screen ? toOutputLook(lookId!, screen) : undefined

        if (JSON.stringify(current ?? null) === JSON.stringify(next ?? null)) return
        changed = true

        const output = { ...outputs[id] }
        if (next) output.proLook = next
        else delete output.proLook
        result[id] = output
    })

    return changed ? result : null
}

// The layers an output renders: the look's layers if it has a look, otherwise its style's layers.
export function getLookLayers(output: Output | undefined, styleLayers: string[]) {
    if (!output || output.stageOutput || !output.proLook?.layers) return styleLayers
    return output.proLook.layers
}

export function filterLookProps(output: Output | undefined, overlayIds: string[]) {
    const hidden = output && !output.stageOutput ? output.proLook?.hiddenProps || [] : []
    if (!hidden.length) return overlayIds
    return overlayIds.filter((id) => !hidden.includes(id))
}
