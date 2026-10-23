<script lang="ts">
    // Edit Audience Looks: per audience screen, choose the style, the visible layers and which props are shown.
    import { dictionary, outputs, overlays, special, styles } from "../../../stores"
    import type { AudienceLook, LookScreen } from "../../../utils/audienceLooks"
    import { getAudienceOutputIds, getDefaultLookScreen } from "../../../utils/audienceLooks"
    import { translateText } from "../../../utils/language"
    import { activateLook, addLook, deleteLook, updateLook } from "../../output/proLooks"
    import Icon from "../../helpers/Icon.svelte"
    import MaterialButton from "../../inputs/MaterialButton.svelte"
    import MaterialCheckbox from "../../inputs/MaterialCheckbox.svelte"
    import MaterialDropdown from "../../inputs/MaterialDropdown.svelte"
    import MaterialTextInput from "../../inputs/MaterialTextInput.svelte"
    import MaterialToggleButtons from "../../inputs/MaterialToggleButtons.svelte"

    $: looks = ($special.proLooks || {}) as { [id: string]: AudienceLook }
    $: lookList = Object.entries(looks)
        .map(([id, a]) => ({ id, name: a.name }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""))

    let selectedId = $special.proActiveLook || ""
    $: if (!looks[selectedId]) selectedId = lookList[0]?.id || ""
    $: look = looks[selectedId]

    $: screens = getAudienceOutputIds($outputs).map((id) => ({ id, name: $outputs[id].name || id }))
    $: styleOptions = [{ value: "", label: translateText("pro_layout.look_screen_style", $dictionary) }, ...Object.entries($styles).map(([value, a]) => ({ value, label: a.name || value }))]
    $: propList = Object.entries($overlays)
        .map(([id, a]) => ({ id, name: a.name || id }))
        .sort((a, b) => a.name.localeCompare(b.name))

    $: layerOptions = [
        { value: "background", label: translateText("pro_layout.layer_media", $dictionary), icon: "image" },
        { value: "slide", label: translateText("pro_layout.layer_slide", $dictionary), icon: "slide" },
        { value: "overlays", label: translateText("pro_layout.layer_props", $dictionary), icon: "overlays" }
    ]

    function newLook() {
        selectedId = addLook(translateText("pro_layout.new_look", $dictionary))
    }

    function rename(name: string) {
        if (!look) return
        updateLook(selectedId, { ...look, name })
    }

    function setScreen(screenId: string, screen: LookScreen | null) {
        if (!look) return
        const lookScreens = { ...look.screens }
        if (screen) lookScreens[screenId] = screen
        else delete lookScreens[screenId]
        updateLook(selectedId, { ...look, screens: lookScreens })
    }

    function toggleProp(screenId: string, propId: string, visible: boolean) {
        const screen = look.screens[screenId]
        const hidden = screen.hiddenProps.filter((id) => id !== propId)
        if (!visible) hidden.push(propId)
        setScreen(screenId, { ...screen, hiddenProps: hidden })
    }

    function remove() {
        if (!selectedId) return
        deleteLook(selectedId)
        selectedId = ""
    }
</script>

<div class="looks">
    <div class="list">
        {#each lookList as item}
            <button class:active={item.id === selectedId} on:click={() => (selectedId = item.id)}>
                <Icon id="screen" size={0.9} white />
                <span>{item.name || translateText("main.unnamed", $dictionary)}</span>
                {#if $special.proActiveLook === item.id}<span class="live">{translateText("pro_layout.look_live", $dictionary)}</span>{/if}
            </button>
        {/each}

        <MaterialButton variant="outlined" icon="add" style="width: 100%;margin-top: 6px;" on:click={newLook}>
            {translateText("pro_layout.new_look", $dictionary)}
        </MaterialButton>
    </div>

    <div class="editor">
        {#if look}
            <div class="row">
                <MaterialTextInput label="pro_layout.look_name" value={look.name} on:change={(e) => rename(e.detail)} />
                <MaterialButton icon="play" title="pro_layout.look_activate" on:click={() => activateLook(selectedId)} />
                <MaterialButton icon="delete" title="actions.delete" on:click={remove} />
            </div>

            {#each screens as screen}
                {@const config = look.screens[screen.id]}
                <div class="screen">
                    <div class="screenHeader">
                        <Icon id="screen" size={0.9} white />
                        <span>{screen.name}</span>
                        <MaterialCheckbox label="pro_layout.look_use_screen" checked={!!config} on:change={(e) => setScreen(screen.id, e.detail ? getDefaultLookScreen() : null)} />
                    </div>

                    {#if config}
                        <MaterialDropdown label="pro_layout.look_style" options={styleOptions} value={config.style || ""} on:change={(e) => setScreen(screen.id, { ...config, style: e.detail || undefined })} />
                        <MaterialToggleButtons label="pro_layout.look_layers" value={config.layers} options={layerOptions} on:change={(e) => setScreen(screen.id, { ...config, layers: e.detail })} />

                        {#if config.layers.includes("overlays") && propList.length}
                            <div class="props">
                                <p class="propsTitle">{translateText("pro_layout.look_props", $dictionary)}</p>
                                {#each propList as prop}
                                    <MaterialCheckbox label={prop.name} checked={!config.hiddenProps.includes(prop.id)} on:change={(e) => toggleProp(screen.id, prop.id, e.detail)} />
                                {/each}
                            </div>
                        {/if}
                    {/if}
                </div>
            {/each}

            {#if !screens.length}
                <p class="empty">{translateText("pro_layout.look_no_screens", $dictionary)}</p>
            {/if}
        {:else}
            <p class="empty">{translateText("pro_layout.look_none", $dictionary)}</p>
        {/if}
    </div>
</div>

<style>
    .looks {
        display: flex;
        gap: 12px;
        min-height: 360px;
    }

    .list {
        display: flex;
        flex-direction: column;
        gap: 2px;
        width: 200px;
        flex-shrink: 0;
    }
    .list button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background: none;
        border: none;
        border-radius: 4px;
        color: var(--text);
        font-family: inherit;
        text-align: start;
        cursor: pointer;
    }
    .list button:hover {
        background-color: var(--hover);
    }
    .list button.active {
        background-color: var(--primary-lighter);
    }
    .live {
        margin-inline-start: auto;
        font-size: 0.75em;
        color: var(--secondary);
    }

    .editor {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 0;
        max-height: 60vh;
        overflow-y: auto;
    }
    .row {
        display: flex;
        gap: 4px;
        align-items: stretch;
    }

    .screen {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px;
        border-radius: 6px;
        background-color: var(--primary-darker);
    }
    .screenHeader {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
    }
    .screenHeader :global(label),
    .screenHeader :global(.checkbox) {
        margin-inline-start: auto;
    }

    .props {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding-top: 4px;
    }
    .propsTitle {
        font-size: 0.8em;
        opacity: 0.7;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }

    .empty {
        opacity: 0.6;
        padding: 20px;
        text-align: center;
    }
</style>
