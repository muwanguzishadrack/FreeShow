<script lang="ts">
    // ProPresenter-style bar under the slide grid:
    // + new slide · new arrangement | transition time | slide timer | view modes · size slider
    import { createEventDispatcher } from "svelte"
    import { activePopup, dictionary, slidesOptions, transitionData } from "../../stores"
    import { translateText } from "../../utils/language"
    import { history } from "../helpers/history"
    import Icon from "../helpers/Icon.svelte"

    export let isLocked = false
    export let canAddArrangement = false
    export let totalTime = "0s"

    const dispatch = createEventDispatcher()

    $: transitionSeconds = Math.round((($transitionData.text?.duration ?? 500) / 1000) * 10) / 10

    const views: { id: "grid" | "lyrics" | "list"; icon: string; label: string }[] = [
        { id: "grid", icon: "grid", label: "show.grid" },
        { id: "lyrics", icon: "lyrics", label: "show.lyrics" },
        { id: "list", icon: "list", label: "show.list" }
    ]

    // the size slider grows thumbnails to the right (fewer columns)
    const MIN_COLUMNS = 2
    const MAX_COLUMNS = 10
    $: sizeValue = MAX_COLUMNS + MIN_COLUMNS - ($slidesOptions.columns || 4)
    function setSize(e: Event) {
        const value = Number((e.target as HTMLInputElement).value)
        slidesOptions.set({ ...$slidesOptions, columns: MAX_COLUMNS + MIN_COLUMNS - value })
    }
</script>

<div class="bar">
    <div class="group">
        <button disabled={isLocked} data-title={translateText("new.slide", $dictionary)} on:click={() => history({ id: "SLIDES" })}>
            <Icon id="add" size={1} white />
        </button>
        <button disabled={isLocked || !canAddArrangement} data-title={translateText("show.new_arrangement", $dictionary)} on:click={(e) => dispatch("newArrangement", e)}>
            <Icon id="layout" size={0.95} white />
        </button>
    </div>

    <div class="divider" />

    <button class="text" data-title={translateText("popup.transition", $dictionary)} on:click={() => activePopup.set("transition")}>
        <Icon id="transition" size={0.95} white />
        <span>{transitionSeconds}s</span>
    </button>

    <button class="text" disabled={isLocked} data-title={translateText("popup.next_timer", $dictionary) + (totalTime !== "0s" ? `: ${totalTime}` : "")} on:click={() => activePopup.set("next_timer")}>
        <Icon id="clock" size={0.95} white={totalTime === "0s"} />
        {#if totalTime !== "0s"}<span>{totalTime}</span>{/if}
    </button>

    <div class="spacer" />

    <div class="group">
        {#each views as view}
            <button class:active={$slidesOptions.mode === view.id} data-title={translateText(view.label, $dictionary)} on:click={() => slidesOptions.set({ ...$slidesOptions, mode: view.id })}>
                <Icon id={view.icon} size={1} white={$slidesOptions.mode !== view.id} />
            </button>
        {/each}
    </div>

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

    .group {
        display: flex;
        gap: 2px;
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
    button:hover:not(:disabled) {
        background-color: var(--hover);
    }
    button:disabled {
        opacity: 0.35;
        cursor: default;
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
