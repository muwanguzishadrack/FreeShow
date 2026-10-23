import { describe, expect, it } from "vitest"
import type { Outputs } from "../../types/Output"
import { applyLookToOutputs, createLook, filterLookProps, getLookLayers, type AudienceLook } from "./audienceLooks"

const outputs = {
    main: { enabled: true, active: true, name: "Main", style: "default" },
    side: { enabled: true, active: true, name: "Side screens" },
    stage: { enabled: true, active: true, name: "Stage", stageOutput: "layout1" }
} as unknown as Outputs

const lowerThirds: AudienceLook = {
    name: "Lower thirds",
    screens: {
        main: { style: "lower_third", layers: ["background", "slide"], hiddenProps: ["logo"] },
        stage: { layers: [], hiddenProps: [] } // must be ignored
    }
}

describe("createLook", () => {
    it("adds every audience screen with all layers, but not stage screens", () => {
        const look = createLook("New look", outputs)
        expect(Object.keys(look.screens)).toEqual(["main", "side"])
        expect(look.screens.main).toEqual({ layers: ["background", "slide", "overlays"], hiddenProps: [] })
    })
})

describe("applyLookToOutputs", () => {
    it("applies configured screens and leaves the rest without a look", () => {
        const result = applyLookToOutputs(outputs, "lt", lowerThirds)!
        expect(result.main.proLook).toEqual({ id: "lt", style: "lower_third", layers: ["background", "slide"], hiddenProps: ["logo"] })
        expect(result.side.proLook).toBeUndefined()
        expect(result.stage.proLook).toBeUndefined()
        // the screen's own style is not changed
        expect(result.main.style).toBe("default")
    })

    it("removes looks when going back to Default", () => {
        const applied = applyLookToOutputs(outputs, "lt", lowerThirds)!
        const cleared = applyLookToOutputs(applied, null, null)!
        expect(cleared.main.proLook).toBeUndefined()
    })

    it("returns null when nothing changes", () => {
        const applied = applyLookToOutputs(outputs, "lt", lowerThirds)!
        expect(applyLookToOutputs(applied, "lt", lowerThirds)).toBeNull()
        expect(applyLookToOutputs(outputs, null, null)).toBeNull()
    })
})

describe("rendering helpers", () => {
    const applied = applyLookToOutputs(outputs, "lt", lowerThirds)!

    it("uses the look's layers instead of the style's", () => {
        expect(getLookLayers(applied.main, ["background", "slide", "overlays"])).toEqual(["background", "slide"])
        expect(getLookLayers(applied.side, ["slide"])).toEqual(["slide"])
    })

    it("hides the look's props", () => {
        expect(filterLookProps(applied.main, ["logo", "clock"])).toEqual(["clock"])
        expect(filterLookProps(applied.side, ["logo", "clock"])).toEqual(["logo", "clock"])
    })
})
