<script lang="ts">
    // ProPresenter-style controls under the preview: Clear To Logo, Stage Only, Advance.
    import { activePage, dictionary, outLocked, outputs, settingsTab, special } from "../../../stores"
    import { translateText } from "../../../utils/language"
    import Icon from "../../helpers/Icon.svelte"
    import { clearToLogo, isAdvanceEnabled, isStageOnly, toggleAdvance, toggleStageOnly } from "../proOutputControls"

    $: logo = $special.proLogo || ""
    $: stageOnly = isStageOnly($outputs)
    $: advance = isAdvanceEnabled($special)

    function logoClick() {
        if (!logo) {
            // no logo chosen yet: open the setting
            settingsTab.set("general")
            activePage.set("settings")
            return
        }
        clearToLogo()
    }
</script>

<div class="bar">
    <button class="control" disabled={$outLocked} data-title={translateText(logo ? "pro_layout.clear_to_logo_tip" : "pro_layout.choose_logo", $dictionary)} on:click={logoClick}>
        <Icon id="image" size={0.9} white />
        <span>{translateText("pro_layout.clear_to_logo", $dictionary)}</span>
    </button>

    <button class="control toggle" class:on={stageOnly} disabled={$outLocked} data-title={translateText("pro_layout.stage_only_tip", $dictionary)} on:click={toggleStageOnly}>
        <Icon id="stage" size={0.9} white />
        <span>{translateText("pro_layout.stage_only", $dictionary)}</span>
    </button>

    <button class="control toggle" class:on={advance} data-title={translateText("pro_layout.advance_tip", $dictionary)} on:click={toggleAdvance}>
        <Icon id="clock" size={0.9} white />
        <span>{translateText("pro_layout.advance", $dictionary)}</span>
    </button>
</div>

<style>
    .bar {
        display: flex;
        gap: 2px;
        padding: 2px 0;
        border-top: 1px solid var(--primary-lighter);
    }

    .control {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 6px 4px;

        background-color: var(--primary-darker);
        border: none;
        color: var(--text);
        font-family: inherit;
        font-size: 0.8em;
        cursor: pointer;
        white-space: nowrap;
    }
    .control:hover:not(:disabled) {
        background-color: var(--hover);
    }
    .control:disabled {
        opacity: 0.4;
        cursor: default;
    }

    .toggle {
        opacity: 0.7;
    }
    .toggle.on {
        opacity: 1;
        box-shadow: inset 0 -2px 0 var(--secondary);
    }
</style>
