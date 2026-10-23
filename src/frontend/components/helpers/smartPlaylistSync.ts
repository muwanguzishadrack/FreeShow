import { get } from "svelte/store"
import { activeProject, projects, shows } from "../../stores"
import { getSmartProjectShows } from "../../utils/smartPlaylists"

let syncTimeout: ReturnType<typeof setTimeout> | null = null

// re-evaluate smart playlists when the library or projects change (debounced)
export function startSmartPlaylistSync() {
    shows.subscribe(scheduleSync)
    projects.subscribe(scheduleSync)
    // date based rules ("used within 7 days") can change without any store update
    activeProject.subscribe(scheduleSync)
}

function scheduleSync() {
    if (syncTimeout) clearTimeout(syncTimeout)
    syncTimeout = setTimeout(() => {
        syncTimeout = null
        syncSmartProjects()
    }, 300)
}

export function syncSmartProjects() {
    const allShows = get(shows)
    const allProjects = get(projects)
    const now = Date.now()

    const changes: { [id: string]: ReturnType<typeof getSmartProjectShows> } = {}
    Object.entries(allProjects).forEach(([id, project]) => {
        if (!project?.smart || project.deleted) return
        const newShows = getSmartProjectShows(project.shows || [], project.smart, allShows, now)
        if (newShows) changes[id] = newShows
    })

    // only update the store when something changed, so the projects subscription doesn't loop
    if (!Object.keys(changes).length) return
    projects.update((a) => {
        Object.entries(changes).forEach(([id, newShows]) => {
            if (a[id] && newShows) a[id].shows = newShows
        })
        return a
    })
}
