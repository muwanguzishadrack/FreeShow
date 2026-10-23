// ProPresenter terminology for the English UI when the "ProPresenter layout" setting is on.
// Only display strings change; data, ids and translation keys stay the same.

import type { Dictionary } from "../../types/Settings"

export const PRO_LABELS: { [section: string]: { [key: string]: string } } = {
    remote: { projects: "Playlists", project: "Playlist", shows: "Presentations" },
    guide_title: { projects: "Playlists", project: "Playlist" },
    formats: { project: "Playlist", overlay: "Prop", template: "Theme" },
    new: { project: "New playlist", show: "New presentation" },
    tabs: { shows: "Presentations", overlays: "Props", templates: "Themes", functions: "Macros" },
    preview: { overlays: "Props" },
    empty: { project_select: "Select a playlist", layout: "No arrangement selected", layouts: "No arrangements" },
    show: { new_layout: "New arrangement" },
    context: { addToProject: "Add to playlist" },
    export: { current_project: "Current playlist", all_projects: "All playlists", project: "Playlist" },
    actions: {
        project_template: "Playlist template",
        id_select_project: "Open playlist",
        next_project_item: "Next playlist item",
        previous_project_item: "Previous playlist item"
    },
    smart_playlist: { convert_to_normal: "Convert to normal playlist" }
}

// returns a new dictionary with ProPresenter labels applied (English only)
export function applyProLabels(dictionary: Dictionary, locale: string): Dictionary {
    if (locale !== "en") return dictionary

    const result: Dictionary = { ...dictionary }
    Object.entries(PRO_LABELS).forEach(([section, labels]) => {
        if (!result[section]) return
        result[section] = { ...result[section], ...labels }
    })
    return result
}
