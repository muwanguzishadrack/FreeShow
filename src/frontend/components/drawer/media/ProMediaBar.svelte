<script lang="ts">
    // ProPresenter-style bar at the bottom of the media bin:
    // ‹ back · folder · media transition time | Grid · List · size slider
    import { createEventDispatcher } from "svelte"
    import { activePopup, dictionary, mediaOptions, transitionData } from "../../../stores"
    import { translateText } from "../../../utils/language"
    import Icon from "../../helpers/Icon.svelte"

    export let canGoBack = false
    export let folderName = ""
    export let fileCount = 0

    const dispatch = createEventDispatcher()

    $: transitionSeconds = Math.round((($transitionData.media?.duration ?? 800) / 1000) * 10) / 10

    const views: { id: "grid" | "list"; icon: string; label: string }[] = [
        { id: "grid", icon: "grid", label: "show.grid" },
        { id: "list", icon: "list", label: "show.list" }
    ]

    // the size slider grows thumbnails to the right (fewer columns)
    const MIN_COLUMNS = 2
    const MAX_COLUMNS = 10
    $: sizeValue = MAX_COLUMNS + MIN_COLUMNS - ($mediaOptions.columns || 5)
    function setSize(e: Event) {
        const value = Number((e.target as HTMLInputElement).value)
        mediaOptions.set({ ...$mediaOptions, columns: MAX_COLUMNS + MIN_COLUMNS - value })
    }
</script>

<div class="bar">
    {#if canGoBack}
        <button data-title={translateText("actions.back", $dictionary)} on:click={() => dispatch("back")}>
            <Icon id="back" size={0.95} white />
        </button>
        <span class="folder"
            >{folderName}{#if fileCount}<span class="count">{fileCount}</span>{/if}</span
        >
        <div class="divider" />
    {/if}

    <button class="text" data-title={translateText("popup.transition", $dictionary)} on:click={() => activePopup.set("transition")}>
        <Icon id="transition" size={0.95} white />
        <span>{transitionSeconds}s</span>
    </button>

    <div class="spacer" />

    {#each views as view}
        <button class:active={$mediaOptions.mode === view.id} data-title={translateText(view.label, $dictionary)} on:click={() => mediaOptions.set({ ...$mediaOptions, mode: view.id })}>
            <Icon id={view.icon} size={1} white={$mediaOptions.mode !== view.id} />
        </button>
    {/each}

    <input class="size" type="range" min={MIN_COLUMNS} max={MAX_COLUMNS} step="1" value={sizeValue} data-title={translateText("actions.zoom", $dictionary)} on:input={setSize} />
</div>

<style>
    .bar {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        min-height: 34px;
        background-color: var(--primary-darkest);
        border-top: 1px solid var(--primary-lighter);
    }

    .divider {
        width: 1px;
        height: 18px;
        margin: 0 4px;
        background-color: var(--primary-lighter);
    }
    .spacer {
        flex: 1;
    }

    .folder {
        display: flex;
        align-items: center;
        gap: 6px;
        max-width: 240px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 0.85em;
        opacity: 0.85;
    }
    .count {
        opacity: 0.5;
        font-size: 0.9em;
    }

    button {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 6px;
        background: none;
        border: none;
        border-radius: 4px;
        color: var(--text);
        font-family: inherit;
        font-size: 0.85em;
        cursor: pointer;
    }
    button:hover {
        background-color: var(--hover);
    }
    button.active {
        background-color: var(--primary-lighter);
    }

    .size {
        width: 110px;
        margin-inline-start: 8px;
        accent-color: var(--secondary);
    }
</style>
