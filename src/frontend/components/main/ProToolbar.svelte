<script lang="ts">
    // ProPresenter-style toolbar: icon over label, grouped like the app operators are used to.
    // Only used when the "ProPresenter layout" setting is on (special.proLayout !== false).
    import type { DrawerTabIds } from "../../../types/Tabs"
    import { activeDrawerTab, activeEdit, activePage, activeShow, dictionary, drawer, drawerOpenedInEdit, editMode, quickSearchActive } from "../../stores"
    import { DEFAULT_DRAWER_HEIGHT } from "../../utils/common"
    import { translateText } from "../../utils/language"
    import Icon from "../helpers/Icon.svelte"

    export let editDisabled = false

    type ToolbarItem = { id: string; icon: string; label: string; active?: boolean; disabled?: boolean; action: () => void }

    $: drawerOpen = $drawer.height > 40
    // the bin is only visibly open on the Show page, or in Edit when the user expanded it there
    $: binVisible = drawerOpen && ($activePage === "show" || ($activePage === "edit" && $drawerOpenedInEdit))
    $: activeBin = binVisible ? $activeDrawerTab : null

    function openDrawer(tab: DrawerTabIds) {
        if ($activePage !== "show" && $activePage !== "edit") activePage.set("show")

        // clicking the active tab again collapses the bin, like ProPresenter's toggles
        if (activeBin === tab) {
            drawer.set({ height: 40, stored: $drawer.height })
            return
        }

        activeDrawerTab.set(tab)
        if (!drawerOpen) drawer.set({ height: $drawer.stored ?? DEFAULT_DRAWER_HEIGHT, stored: null })
    }

    function openEdit(mode: "default" | "text_edit") {
        if (editDisabled) return
        editMode.set(mode)
        activePage.set("edit")
        if ($activeShow && ($activeShow.type || "show") === "show") activeEdit.set({ slide: $activeEdit.slide || 0, items: [], showId: $activeShow.id })
    }

    $: left = [
        { id: "search", icon: "search", label: "pro_layout.search", action: () => quickSearchActive.set(true) },
        { id: "theme", icon: "templates", label: "pro_layout.theme", active: activeBin === "templates", action: () => openDrawer("templates") }
    ] as ToolbarItem[]

    $: modes = [
        { id: "show", icon: "show", label: "pro_layout.show", active: $activePage === "show", action: () => activePage.set("show") },
        { id: "edit", icon: "edit", label: "pro_layout.edit", active: $activePage === "edit" && $editMode !== "text_edit", disabled: editDisabled, action: () => openEdit("default") },
        { id: "reflow", icon: "text_edit", label: "pro_layout.reflow", active: $activePage === "edit" && $editMode === "text_edit", disabled: editDisabled, action: () => openEdit("text_edit") },
        { id: "bible", icon: "scripture", label: "pro_layout.bible", active: activeBin === "scripture", action: () => openDrawer("scripture") }
    ] as ToolbarItem[]

    $: panels = [
        { id: "media", icon: "media", label: "pro_layout.media", active: activeBin === "media", action: () => openDrawer("media") },
        { id: "audio", icon: "audio", label: "pro_layout.audio", active: activeBin === "audio", action: () => openDrawer("audio") },
        { id: "props", icon: "overlays", label: "pro_layout.props", active: activeBin === "overlays", action: () => openDrawer("overlays") },
        { id: "macros", icon: "functions", label: "pro_layout.macros", active: activeBin === "functions", action: () => openDrawer("functions") },
        { id: "stage", icon: "stage", label: "pro_layout.stage", active: $activePage === "stage", action: () => activePage.set("stage") }
    ] as ToolbarItem[]

    $: groups = [left, modes, panels]
</script>

<div class="toolbar">
    {#each groups as group, i}
        {#if i > 0}<div class="divider" />{/if}

        <div class="group">
            {#each group as item}
                <button class="item" class:active={item.active} disabled={item.disabled} data-title={translateText(item.label, $dictionary)} on:click={item.action}>
                    <span class="pill"><Icon id={item.icon} size={1.15} white /></span>
                    <span class="label">{translateText(item.label, $dictionary)}</span>
                </button>
            {/each}
        </div>
    {/each}
</div>

<style>
    .toolbar {
        display: flex;
        align-items: center;
        height: 100%;
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

    @media screen and (max-width: 1000px) {
        .label {
            display: none;
        }
    }
</style>
