<script lang="ts">
    // ProPresenter-style left column, top to bottom:
    // LIBRARY (libraries) · PLAYLIST (playlists) · items of the selection · MEDIA (media folders, aligned with the bin).
    // Only used when the "ProPresenter layout" setting is on.
    import { activeDrawerTab, activeProfile, activeProject, categories, dictionary, drawer, folders, projects, sortedShowsList } from "../../stores"
    import { translateText } from "../../utils/language"
    import { getAccess } from "../../utils/profile"
    import Navigation from "../drawer/Navigation.svelte"
    import { history } from "../helpers/history"
    import Icon from "../helpers/Icon.svelte"
    import ShowButton from "../inputs/ShowButton.svelte"
    import { openProject } from "./project"
    import ProjectContentList from "./ProjectContentList.svelte"

    // what the items list shows: a library's presentations or the selected playlist's items
    let mode: "library" | "playlist" = $activeProject ? "playlist" : "library"
    let activeLibrary = "all"
    let filter = ""
    let libraryCollapsed = false
    let playlistCollapsed = false

    // LIBRARY

    $: profile = $activeProfile ? getAccess("shows") : {}
    $: libraries = Object.entries($categories)
        .filter(([id, a]) => !a.isArchive && profile[id] !== "none")
        .map(([id, a]) => ({ id, name: translateText(a.name, $dictionary) || a.name, icon: a.icon || "shows" }))
        .sort((a, b) => a.name.localeCompare(b.name))

    function selectLibrary(id: string) {
        activeLibrary = id
        mode = "library"
    }

    function newLibrary() {
        history({ id: "UPDATE", location: { page: "drawer", id: "category_shows" } })
    }

    $: visibleShows = $sortedShowsList.filter((show) => {
        const category = show.category || ""
        if ($categories[category]?.isArchive || profile[category] === "none") return false
        return activeLibrary === "all" || category === activeLibrary
    })
    $: filteredShows = filter ? visibleShows.filter((a) => a.name?.toLowerCase().includes(filter.toLowerCase())) : visibleShows

    // PLAYLIST

    $: projectProfile = $activeProfile ? getAccess("projects") : {}
    $: visibleProjects = Object.entries($projects)
        .filter(([, a]) => a && !a.deleted && !a.archived)
        .map(([id, a]) => ({ id, name: a.name || translateText("main.unnamed", $dictionary), parent: $folders[a.parent] && !$folders[a.parent].deleted ? a.parent : "/", smart: !!a.smart }))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    $: folderIds = [...new Set(visibleProjects.map((a) => a.parent).filter((id) => id !== "/"))]
    $: playlistGroups = [
        { id: "/", name: "", items: visibleProjects.filter((a) => a.parent === "/") },
        ...folderIds
            .map((id) => ({ id, name: $folders[id]?.name || "", items: visibleProjects.filter((a) => a.parent === id) }))
            .filter((group) => projectProfile[group.id] !== "none")
            .sort((a, b) => a.name.localeCompare(b.name))
    ].filter((group) => group.items.length)

    function selectPlaylist(id: string) {
        openProject(id, false)
        mode = "playlist"
    }

    function newPlaylist() {
        history({ id: "UPDATE", newData: { replace: { parent: "/" } }, location: { page: "show", id: "project" } })
        mode = "playlist"
    }

    $: currentPlaylist = $activeProject ? $projects[$activeProject] : null
    $: if (mode === "playlist" && !currentPlaylist) mode = "library"
    $: itemsTitle = mode === "playlist" ? `${currentPlaylist?.name || ""} · ${translateText((currentPlaylist?.shows?.length || 0) === 1 ? "pro_layout.item" : "pro_layout.items", $dictionary).replace("{count}", String(currentPlaylist?.shows?.length || 0))}` : translateText(filteredShows.length === 1 ? "pro_layout.item" : "pro_layout.items", $dictionary).replace("{count}", String(filteredShows.length))

    // MEDIA (aligned with the media bin under the slides)

    $: binOpen = $drawer.height > 40
    $: mediaHeight = binOpen ? $drawer.height : 0

    function openMediaBin() {
        activeDrawerTab.set("media")
        if (!binOpen) drawer.set({ height: $drawer.stored ?? 300, stored: null })
    }
</script>

<div class="sidebar">
    <div class="upper">
        <section class="lists">
            <!-- LIBRARY -->
            <div class="header">
                <span>{translateText("pro_layout.library", $dictionary)}</span>
                <span class="headerButtons">
                    <button data-title={translateText("pro_layout.new_library", $dictionary)} on:click={newLibrary}><Icon id="add" size={0.8} white /></button>
                    <button data-title={translateText("actions.collapse", $dictionary)} on:click={() => (libraryCollapsed = !libraryCollapsed)}><Icon id={libraryCollapsed ? "arrow_down" : "arrow_up"} size={0.8} white /></button>
                </span>
            </div>
            {#if !libraryCollapsed}
                <div class="rows">
                    <button class="row" class:active={mode === "library" && activeLibrary === "all"} on:click={() => selectLibrary("all")}>
                        <Icon id="all" size={0.85} white />
                        <span>{translateText("category.all", $dictionary)}</span>
                    </button>
                    {#each libraries as library}
                        <button class="row" class:active={mode === "library" && activeLibrary === library.id} on:click={() => selectLibrary(library.id)}>
                            <Icon id={library.icon} size={0.85} white />
                            <span>{library.name}</span>
                        </button>
                    {/each}
                </div>
            {/if}

            <!-- PLAYLIST -->
            <div class="header">
                <span>{translateText("pro_layout.playlist", $dictionary)}</span>
                <span class="headerButtons">
                    <button data-title={translateText("new.project", $dictionary)} on:click={newPlaylist}><Icon id="add" size={0.8} white /></button>
                    <button data-title={translateText("actions.collapse", $dictionary)} on:click={() => (playlistCollapsed = !playlistCollapsed)}><Icon id={playlistCollapsed ? "arrow_down" : "arrow_up"} size={0.8} white /></button>
                </span>
            </div>
            {#if !playlistCollapsed}
                <div class="rows playlists">
                    {#each playlistGroups as group}
                        {#if group.name}<div class="folder"><Icon id="folder" size={0.75} white />{group.name}</div>{/if}
                        {#each group.items as playlist}
                            <button class="row" class:indent={!!group.name} class:active={mode === "playlist" && $activeProject === playlist.id} on:click={() => selectPlaylist(playlist.id)}>
                                <Icon id={playlist.smart ? "stars" : "project"} size={0.85} white />
                                <span>{playlist.name}</span>
                            </button>
                        {/each}
                    {/each}
                </div>
            {/if}
        </section>

        <!-- ITEMS of the selected library or playlist -->
        <section class="items">
            <div class="header sub"><span>{itemsTitle}</span></div>

            {#if mode === "playlist" && currentPlaylist}
                <div class="playlistItems">
                    {#key $activeProject}
                        <ProjectContentList tree={[]} />
                    {/key}
                </div>
            {:else}
                <div class="list">
                    {#each filteredShows as show (show.id)}
                        <ShowButton id={show.id} {show} class="#drawer_show_button" />
                    {/each}
                </div>
                <div class="filter">
                    <Icon id="search" size={0.8} white />
                    <input type="text" placeholder={translateText("pro_layout.filter", $dictionary)} bind:value={filter} />
                </div>
            {/if}
        </section>
    </div>

    <!-- MEDIA -->
    <section class="media" style={binOpen ? `height: ${mediaHeight}px;` : ""}>
        <div class="header">
            <span>{translateText("pro_layout.media", $dictionary)}</span>
        </div>
        {#if binOpen}
            <div class="mediaFolders" role="none" on:click={openMediaBin}>
                <Navigation id="media" />
            </div>
        {/if}
    </section>
</div>

<style>
    .sidebar {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        font-size: 0.9em;
    }

    .upper {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    section {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 0;
    }
    .lists {
        flex-shrink: 0;
        max-height: 55%;
        overflow-y: auto;
    }
    .items {
        flex: 1;
        border-top: 1px solid var(--primary-lighter);
    }
    .media {
        flex-shrink: 0;
        border-top: 2px solid var(--primary-darkest);
    }

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 10px;
        min-height: 26px;

        font-size: 0.8em;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        opacity: 0.75;
        background-color: var(--primary-darker);
    }
    .header.sub {
        text-transform: none;
        letter-spacing: 0;
    }
    .headerButtons {
        display: flex;
        gap: 2px;
    }
    .headerButtons button {
        display: flex;
        padding: 2px;
        background: none;
        border: none;
        border-radius: 3px;
        cursor: pointer;
    }
    .headerButtons button:hover {
        background-color: var(--hover);
    }

    .rows {
        display: flex;
        flex-direction: column;
    }
    .row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 3px 12px;

        background: none;
        border: none;
        color: var(--text);
        font-family: inherit;
        font-size: 1em;
        text-align: start;
        cursor: pointer;
    }
    .row span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .row.indent {
        padding-inline-start: 26px;
    }
    .row:hover {
        background-color: var(--hover);
    }
    .row.active {
        background-color: var(--primary-lighter);
    }
    .folder {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 3px 12px;
        font-size: 0.85em;
        opacity: 0.6;
    }

    .list,
    .playlistItems {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }
    .playlistItems {
        position: relative;
    }

    .filter {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 6px;
        padding: 4px 10px;
        border-radius: 12px;
        background-color: var(--primary-darker);
    }
    .filter input {
        flex: 1;
        background: none;
        border: none;
        outline: none;
        color: var(--text);
        font-family: inherit;
    }

    .mediaFolders {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
    }
</style>
