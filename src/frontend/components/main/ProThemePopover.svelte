<script lang="ts">
    // ProPresenter-style theme picker under the toolbar's Theme button.
    // Reuses FreeShow's Templates page: clicking a template applies it to the open presentation.
    import { createEventDispatcher } from "svelte"
    import { dictionary } from "../../stores"
    import { translateText } from "../../utils/language"
    import { portal } from "../../utils/portal"
    import Templates from "../drawer/pages/Templates.svelte"
    import Icon from "../helpers/Icon.svelte"

    const dispatch = createEventDispatcher()
    let filter = ""

    function keydown(e: KeyboardEvent) {
        if (e.key === "Escape") dispatch("close")
    }
</script>

<svelte:window on:keydown={keydown} />

<!-- clicking outside closes the picker -->
<div class="backdrop" role="none" use:portal on:click={() => dispatch("close")} />

<div class="popover" use:portal>
    <div class="header">
        <Icon id="templates" size={0.95} white />
        <span class="title">{translateText("pro_layout.theme", $dictionary)}</span>
        <div class="filter">
            <Icon id="search" size={0.8} white />
            <input type="text" placeholder={translateText("pro_layout.filter", $dictionary)} bind:value={filter} />
        </div>
        <button class="close" data-title={translateText("actions.close", $dictionary)} on:click={() => dispatch("close")}>
            <Icon id="close" size={0.95} white />
        </button>
    </div>
    <div class="content">
        <Templates active="all" searchValue={filter} />
    </div>
</div>

<style>
    .backdrop {
        position: fixed;
        inset: 0;
        z-index: 5000;
    }

    .popover {
        position: fixed;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 5001;

        display: flex;
        flex-direction: column;
        width: min(640px, 90vw);
        height: min(420px, 70vh);

        background-color: var(--primary);
        border: 1px solid var(--primary-lighter);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgb(0 0 0 / 0.5);
        overflow: hidden;
        -webkit-app-region: no-drag;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background-color: var(--primary-darkest);
    }
    .title {
        font-weight: 600;
    }
    .filter {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 6px;
        max-width: 260px;
        margin-inline-start: auto;
        padding: 3px 10px;
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
    .close {
        display: flex;
        background: none;
        border: none;
        padding: 4px;
        border-radius: 4px;
        cursor: pointer;
    }
    .close:hover {
        background-color: var(--hover);
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
    }
</style>
