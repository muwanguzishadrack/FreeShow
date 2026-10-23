<script lang="ts">
    // ProPresenter-style arrangement picker for the show header.
    import { dictionary, showsCache } from "../../stores"
    import { translateText } from "../../utils/language"
    import { keysToID, sortByName } from "../helpers/array"
    import { setShowLayout } from "../helpers/arrangement"
    import Dropdown from "../inputs/Dropdown.svelte"

    export let showId: string

    $: currentShow = $showsCache[showId]
    $: layouts = sortByName(keysToID(currentShow?.layouts || {})) as { id: string; name: string }[]
    $: activeLayout = currentShow?.settings?.activeLayout || ""
    $: activeName = currentShow?.layouts?.[activeLayout]?.name || translateText("main.unnamed", $dictionary)
</script>

{#if layouts.length}
    <div class="arrangement" data-title={translateText("pro_layout.arrangement", $dictionary)}>
        <span class="label">{translateText("pro_layout.arrangement", $dictionary)}</span>
        <Dropdown style="min-width: 140px;" activeId={activeLayout} value={activeName} options={layouts.map((a) => ({ id: a.id, name: a.name || translateText("main.unnamed", $dictionary) }))} on:click={(e) => setShowLayout(showId, e.detail.id, { name: e.detail.name })} />
    </div>
{/if}

<style>
    .arrangement {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 8px;
        font-size: 0.85em;
    }

    .label {
        opacity: 0.6;
        text-transform: uppercase;
        font-size: 0.85em;
        letter-spacing: 0.04em;
        white-space: nowrap;
    }
</style>
