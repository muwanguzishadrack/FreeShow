<script lang="ts">
    // ProPresenter-style "Look" selector under the preview: switch Audience Looks, or open the look editor.
    import { activePopup, dictionary, special } from "../../../stores"
    import { translateText } from "../../../utils/language"
    import Dropdown from "../../inputs/Dropdown.svelte"
    import { activateLook } from "../proLooks"

    const EDIT = "__edit_looks"

    $: looks = ($special.proLooks || {}) as { [id: string]: { name: string } }
    $: activeId = $special.proActiveLook && looks[$special.proActiveLook] ? $special.proActiveLook : ""

    $: options = [
        { id: "", name: translateText("pro_layout.look_default", $dictionary) },
        ...Object.entries(looks)
            .map(([id, a]) => ({ id, name: a.name || translateText("main.unnamed", $dictionary) }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        { id: EDIT, name: translateText("pro_layout.edit_looks", $dictionary) }
    ]
    $: value = options.find((a) => a.id === activeId)?.name || options[0].name

    function select(id: string) {
        if (id === EDIT) {
            activePopup.set("audience_looks")
            return
        }
        activateLook(id || null)
    }
</script>

<div class="look" data-title={translateText("pro_layout.look_tip", $dictionary)}>
    <span class="label">{translateText("pro_layout.look", $dictionary)}</span>
    <Dropdown style="flex: 1;" {activeId} {value} {options} on:click={(e) => select(e.detail.id)} />
</div>

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
