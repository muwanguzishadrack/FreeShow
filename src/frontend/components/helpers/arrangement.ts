import { get } from "svelte/store"
import { activeProject, activeShow, editingProjectTemplate, projects, projectTemplates, showsCache } from "../../stores"

// Switch the active layout ("arrangement") of a show, and remember it on the current project item.
export function setShowLayout(showId: string, layoutId: string, layoutInfo: { name: string }) {
    if (!get(showsCache)[showId]) return

    showsCache.update((a) => {
        if (a[showId]) {
            if (!a[showId].settings) a[showId].settings = { activeLayout: "", template: null }
            a[showId].settings.activeLayout = layoutId
        }
        return a
    })

    // set active layout in project
    const layoutCount = Object.keys(get(showsCache)[showId]?.layouts || {}).length
    if (layoutCount < 2) return

    const isTemplate = !!get(editingProjectTemplate)
    const projectId = isTemplate ? get(editingProjectTemplate) : get(activeProject)
    const store = isTemplate ? projectTemplates : projects
    const show = get(activeShow)
    const showIndex = show?.index

    if ((show?.type === undefined || show?.type === "show") && showIndex !== undefined && projectId && get(store)[projectId]?.shows?.[showIndex]) {
        store.update((a) => {
            if (a[projectId]?.shows?.[showIndex]) {
                a[projectId].shows[showIndex].layout = layoutId
                a[projectId].shows[showIndex].layoutInfo = layoutInfo
            }
            return a
        })
    }
}
