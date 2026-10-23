<script lang="ts">
    // ProPresenter-style media bin table row: the regular media row (name) plus Type and Format columns.
    import { dictionary } from "../../../stores"
    import { translateText } from "../../../utils/language"
    import { getExtension } from "../../helpers/media"

    export let path = ""
    export let type = ""
    export let header = false

    $: format = getExtension(path).toUpperCase()
</script>

<div class="row" class:header>
    {#if header}
        <span class="name">{translateText("pro_layout.column_name", $dictionary)}</span>
        <span>{translateText("pro_layout.column_type", $dictionary)}</span>
        <span>{translateText("pro_layout.column_format", $dictionary)}</span>
    {:else}
        <div class="name"><slot /></div>
        <span>{type ? translateText(`pro_layout.type_${type}`, $dictionary) : ""}</span>
        <span>{format}</span>
    {/if}
</div>

<style>
    .row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 48px 56px;
        align-items: center;
        gap: 6px;
        padding-inline-end: 10px;
        font-size: 0.85em;
        border-bottom: 1px solid var(--primary-darker);
    }
    .row span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        opacity: 0.75;
    }

    .row.header {
        width: 100%;
        position: sticky;
        top: 0;
        z-index: 2;
        padding: 4px 10px;
        background-color: var(--primary-darkest);
        font-size: 0.75em;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }
    .row.header span {
        opacity: 0.6;
    }

    .name {
        min-width: 0;
    }
</style>
