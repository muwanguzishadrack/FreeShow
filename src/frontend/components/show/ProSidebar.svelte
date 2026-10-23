<script lang="ts">
    // ProPresenter-style left column: LIBRARY (categories + presentation list) above PLAYLIST (projects).
    // Only used when the "ProPresenter layout" setting is on.
    import { activeProfile, categories, dictionary, sortedShowsList } from "../../stores"
    import { translateText } from "../../utils/language"
    import { getAccess } from "../../utils/profile"
    import Icon from "../helpers/Icon.svelte"
    import ShowButton from "../inputs/ShowButton.svelte"
    import Projects from "./Projects.svelte"

    let activeLibrary = "all"
    let filter = ""
    let libraryCollapsed = false

    $: profile = $activeProfile ? getAccess("shows") : {}
    $: libraries = Object.entries($categories)
        .filter(([id, a]) => !a.isArchive && profile[id] !== "none")
        .map(([id, a]) => ({ id, name: translateText(a.name, $dictionary) || a.name, icon: a.icon || "shows" }))
        .sort((a, b) => a.name.localeCompare(b.name))

    $: visibleShows = $sortedShowsList.filter((show) => {
        const category = show.category || ""
        if ($categories[category]?.isArchive || profile[category] === "none") return false
        return activeLibrary === "all" || category === activeLibrary
    })
    $: filteredShows = filter ? visibleShows.filter((a) => a.name?.toLowerCase().includes(filter.toLowerCase())) : visibleShows
</script>

<div class="sidebar">
    <section class="library">
        <div class="header">
            <span>{translateText("pro_layout.library", $dictionary)}</span>
            <button class="headerButton" data-title={translateText("actions.collapse", $dictionary)} on:click={() => (libraryCollapsed = !libraryCollapsed)}>
                <Icon id={libraryCollapsed ? "arrow_down" : "arrow_up"} size={0.8} white />
            </button>
        </div>

        {#if !libraryCollapsed}
            <div class="libraries">
                <button class="row" class:active={activeLibrary === "all"} on:click={() => (activeLibrary = "all")}>
                    <Icon id="all" size={0.9} white={activeLibrary !== "all"} />
                    <span>{translateText("category.all", $dictionary)}</span>
                </button>
                {#each libraries as library}
                    <button class="row" class:active={activeLibrary === library.id} on:click={() => (activeLibrary = library.id)}>
                        <Icon id={library.icon} size={0.9} white={activeLibrary !== library.id} />
                        <span>{library.name}</span>
                    </button>
                {/each}
            </div>
        {/if}

        <div class="header sub">
            <span>{translateText(filteredShows.length === 1 ? "pro_layout.item" : "pro_layout.items", $dictionary).replace("{count}", String(filteredShows.length))}</span>
        </div>

        <div class="items">
            {#each filteredShows as show (show.id)}
                <ShowButton id={show.id} {show} class="#drawer_show_button" />
            {/each}
        </div>

        <div class="filter">
            <Icon id="search" size={0.8} white />
            <input type="text" placeholder={translateText("pro_layout.filter", $dictionary)} bind:value={filter} />
        </div>
    </section>

    <section class="playlist">
        <Projects />
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

    section {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 0;
    }
    .library {
        flex: 1.2;
        border-bottom: 2px solid var(--primary-darkest, #000);
    }
    .playlist {
        flex: 1;
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
        border-top: 1px solid var(--primary-lighter);
    }
    .headerButton {
        display: flex;
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px;
    }

    .libraries {
        display: flex;
        flex-direction: column;
        max-height: 35%;
        overflow-y: auto;
    }
    .row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;

        background: none;
        border: none;
        color: var(--text);
        font-family: inherit;
        font-size: 1em;
        text-align: start;
        cursor: pointer;
    }
    .row:hover {
        background-color: var(--hover);
    }
    .row.active {
        background-color: var(--primary-lighter);
    }

    .items {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
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
</style>
