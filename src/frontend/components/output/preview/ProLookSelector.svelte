<script lang="ts">
    // ProPresenter-style "Look" selector under the preview.
    // For now a look is an output style applied to all audience screens (stage screens are left alone).
    import { dictionary, outputs, styles } from "../../../stores"
    import { translateText } from "../../../utils/language"
    import Dropdown from "../../inputs/Dropdown.svelte"

    $: audienceOutputs = Object.entries($outputs).filter(([, a]) => a.enabled && !a.stageOutput)
    $: currentStyleId = audienceOutputs[0]?.[1]?.style || ""
    $: mixed = audienceOutputs.some(([, a]) => (a.style || "") !== currentStyleId)

    $: options = [
        { id: "", name: translateText("pro_layout.look_default", $dictionary) },
        ...Object.entries($styles)
            .map(([id, a]) => ({ id, name: a.name || id }))
            .sort((a, b) => a.name.localeCompare(b.name))
    ]
    $: value = mixed ? translateText("pro_layout.look_mixed", $dictionary) : options.find((a) => a.id === currentStyleId)?.name || options[0].name

    function setLook(styleId: string) {
        outputs.update((a) => {
            audienceOutputs.forEach(([id]) => {
                if (!a[id]) return
                if (styleId) a[id].style = styleId
                else delete a[id].style
            })
            return a
        })
    }
</script>

{#if audienceOutputs.length}
    <div class="look" data-title={translateText("pro_layout.look_tip", $dictionary)}>
        <span class="label">{translateText("pro_layout.look", $dictionary)}</span>
        <Dropdown style="flex: 1;" activeId={mixed ? "" : currentStyleId} {value} {options} on:click={(e) => setLook(e.detail.id)} />
    </div>
{/if}

<style>
    .look {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        font-size: 0.85em;
        background-color: var(--primary-darkest);
        border-top: 1px solid var(--primary-lighter);
    }

    .label {
        opacity: 0.6;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-size: 0.85em;
    }
</style>
