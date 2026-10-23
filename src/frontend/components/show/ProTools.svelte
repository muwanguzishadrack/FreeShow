<script lang="ts">
    // ProPresenter-style tools panel under the preview: Groups, Audio, Props, Timers, Macros.
    // Reuses FreeShow's own drawer pages so behaviour stays identical.
    import type { TabsObj } from "../../../types/Tabs"
    import { activeShow, dictionary, showsCache } from "../../stores"
    import { translateText } from "../../utils/language"
    import Icon from "../helpers/Icon.svelte"
    import Audio from "../drawer/audio/Audio.svelte"
    import Actions from "../drawer/pages/Actions.svelte"
    import Overlays from "../drawer/pages/Overlays.svelte"
    import Timers from "../drawer/timers/Timers.svelte"
    import Tabs from "../main/Tabs.svelte"
    import { proToolsTab } from "./proToolsState"
    import SlideGroups from "./tools/SlideGroups.svelte"

    const tabs: TabsObj = {
        groups: { name: "tools.groups", icon: "groups" },
        audio: { name: "pro_layout.audio", icon: "audio" },
        props: { name: "pro_layout.props", icon: "overlays" },
        timers: { name: "pro_layout.timers", icon: "timer" },
        macros: { name: "pro_layout.macros", icon: "functions" }
    }

    // shared filter at the bottom, like ProPresenter's tool panels (not used by Groups)
    let filter = ""
    $: if ($proToolsTab) filter = ""

    $: showIsActive = !!$activeShow && ($activeShow.type || "show") === "show" && !!$showsCache[$activeShow.id]
</script>

<div class="main border">
    <Tabs {tabs} bind:active={$proToolsTab} labels={false} />

    <div class="content">
        {#if $proToolsTab === "groups"}
            {#if showIsActive}
                <SlideGroups />
            {/if}
        {:else if $proToolsTab === "audio"}
            <Audio active="all" searchValue={filter} />
        {:else if $proToolsTab === "props"}
            <Overlays active="all" searchValue={filter} />
        {:else if $proToolsTab === "timers"}
            <Timers searchValue={filter} />
        {:else if $proToolsTab === "macros"}
            <Actions searchValue={filter} />
        {/if}
    </div>

    {#if $proToolsTab !== "groups"}
        <div class="filter">
            <Icon id="search" size={0.8} white />
            <input type="text" placeholder={translateText("pro_layout.filter", $dictionary)} bind:value={filter} />
        </div>
    {/if}
</div>

<style>
    .filter {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 6px;
        padding: 4px 10px;
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

    .main {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        height: 100%;
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
        min-height: 0;
    }
</style>
