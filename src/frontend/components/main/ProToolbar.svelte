<script lang="ts">
    // ProPresenter-style toolbar: icon over label, grouped like the app operators are used to.
    // Only used when the "ProPresenter layout" setting is on (special.proLayout !== false).
    import { activeDrawerTab, activePage, dictionary, drawer, drawerOpenedInEdit, editMode, quickSearchActive } from "../../stores"
    import { openEditor, openTool, showSlides, toggleBible, toggleBin } from "../../utils/proActions"
    import { translateText } from "../../utils/language"
    import { portal } from "../../utils/portal"
    import Icon from "../helpers/Icon.svelte"
    import { proCenterView, proToolsTab } from "../show/proToolsState"
    import ProThemePopover from "./ProThemePopover.svelte"

    export let editDisabled = false

    let themeOpen = false
    let moreOpen = false
    let moreLeft = 0

    // the More menu opens under its button
    function openMore() {
        const button = document.querySelector<HTMLElement>(".toolbar .item.more")
        const rect = button?.getBoundingClientRect()
        moreLeft = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
        moreOpen = !moreOpen
    }

    // "More": less common views, like ProPresenter's More menu
    $: moreItems = [
        { id: "calendar", icon: "calendar", label: "tabs.calendar", action: () => toggleBin("calendar") },
        { id: "stage", icon: "stage", label: "pro_layout.stage_editor", action: () => activePage.set("stage") },
        { id: "draw", icon: "draw", label: "menu.draw", action: () => activePage.set("draw") },
        { id: "settings", icon: "settings", label: "menu.settings", action: () => activePage.set("settings") }
    ]

    type ToolbarItem = { id: string; icon: string; label: string; active?: boolean; disabled?: boolean; action: () => void }

    // the bin is only visibly open on the Show page, or in Edit when the user expanded it there
    $: binVisible = $drawer.height > 40 && ($activePage === "show" || ($activePage === "edit" && $drawerOpenedInEdit))
    $: activeBin = binVisible ? $activeDrawerTab : null
    $: showPage = $activePage === "show"
    $: bibleOpen = showPage && $proCenterView === "bible"

    function edit(mode: "default" | "text_edit") {
        if (!editDisabled) openEditor(mode)
    }

    $: left = [
        { id: "search", icon: "search", label: "pro_layout.search", action: () => quickSearchActive.set(true) },
        { id: "theme", icon: "templates", label: "pro_layout.theme", active: themeOpen, action: () => (themeOpen = !themeOpen) }
    ] as ToolbarItem[]

    $: modes = [
        { id: "show", icon: "show", label: "pro_layout.show", active: showPage && !bibleOpen, action: showSlides },
        { id: "edit", icon: "edit", label: "pro_layout.edit", active: $activePage === "edit" && $editMode !== "text_edit", disabled: editDisabled, action: () => edit("default") },
        { id: "reflow", icon: "text_edit", label: "pro_layout.reflow", active: $activePage === "edit" && $editMode === "text_edit", disabled: editDisabled, action: () => edit("text_edit") },
        { id: "bible", icon: "scripture", label: "pro_layout.bible", active: bibleOpen, action: toggleBible },
        { id: "more", icon: "more", label: "pro_layout.more", active: moreOpen, action: openMore }
    ] as ToolbarItem[]

    $: panels = [
        { id: "media", icon: "media", label: "pro_layout.media", active: activeBin === "media", action: () => toggleBin("media") },
        { id: "audio", icon: "audio", label: "pro_layout.audio", active: showPage && $proToolsTab === "audio", action: () => openTool("audio") },
        { id: "props", icon: "overlays", label: "pro_layout.props", active: showPage && $proToolsTab === "props", action: () => openTool("props") },
        { id: "timers", icon: "timer", label: "pro_layout.timers", active: showPage && $proToolsTab === "timers", action: () => openTool("timers") },
        { id: "macros", icon: "functions", label: "pro_layout.macros", active: showPage && $proToolsTab === "macros", action: () => openTool("macros") },
        { id: "stage", icon: "stage", label: "pro_layout.stage", active: $activePage === "stage", action: () => activePage.set("stage") }
    ] as ToolbarItem[]

    // like ProPresenter: tools and modes on the left, panel buttons on the right
    $: clusters = [[left, modes], [panels]]
</script>

<div class="toolbar">
    {#each clusters as groups}
        <div class="cluster">
            {#each groups as group, i}
                {#if i > 0}<div class="divider" />{/if}

                <div class="group">
                    {#each group as item}
                        <button class="item {item.id}" class:active={item.active} disabled={item.disabled} data-title={translateText(item.label, $dictionary)} on:click={item.action}>
                            <span class="pill"><Icon id={item.icon} size={1.15} white /></span>
                            <span class="label">{translateText(item.label, $dictionary)}</span>
                        </button>
                    {/each}
                </div>
            {/each}
        </div>
    {/each}

    {#if themeOpen}
        <ProThemePopover on:close={() => (themeOpen = false)} />
    {/if}

    {#if moreOpen}
        <div class="backdrop" role="none" use:portal on:click={() => (moreOpen = false)} />
        <div class="moreMenu" use:portal style="left: {moreLeft}px;">
            {#each moreItems as item}
                <button
                    on:click={() => {
                        moreOpen = false
                        item.action()
                    }}
                >
                    <Icon id={item.icon} size={0.95} white />
                    <span>{translateText(item.label, $dictionary)}</span>
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .toolbar {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 100%;
        gap: 6px;
        padding: 0 12px;
    }

    .cluster {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .group {
        display: flex;
        gap: 2px;
    }

    .divider {
        width: 1px;
        height: 60%;
        margin: 0 6px;
        background-color: var(--primary-lighter);
    }

    .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;

        min-width: 52px;
        padding: 2px 4px;

        background: none;
        border: none;
        color: var(--text);
        font-family: inherit;
        font-size: 0.72em;
        opacity: 0.85;
        cursor: pointer;
    }
    .item:hover:not(:disabled) {
        opacity: 1;
    }
    .item:disabled {
        opacity: 0.35;
        cursor: default;
    }

    .pill {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 26px;
        border-radius: 13px;
        background-color: var(--primary-lighter);
    }
    .item:hover:not(:disabled) .pill {
        filter: brightness(1.2);
    }
    .item.active .pill {
        background-color: var(--secondary);
    }
    .item.active {
        opacity: 1;
    }

    .label {
        white-space: nowrap;
    }

    .backdrop {
        position: fixed;
        inset: 0;
        z-index: 5000;
    }
    .moreMenu {
        position: fixed;
        top: 60px;
        transform: translateX(-50%);
        z-index: 5001;
        display: flex;
        flex-direction: column;
        min-width: 180px;
        padding: 4px;
        background-color: var(--primary);
        border: 1px solid var(--primary-lighter);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgb(0 0 0 / 0.5);
        -webkit-app-region: no-drag;
    }
    .moreMenu button {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 10px;
        background: none;
        border: none;
        border-radius: 4px;
        color: var(--text);
        font-family: inherit;
        font-size: 0.9em;
        text-align: start;
        cursor: pointer;
    }
    .moreMenu button:hover {
        background-color: var(--hover);
    }

    @media screen and (max-width: 1000px) {
        .label {
            display: none;
        }
    }
</style>
