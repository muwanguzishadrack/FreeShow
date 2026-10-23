<script lang="ts">
    // ProPresenter-style tools panel under the preview: Groups, Audio, Props, Timers, Macros.
    // Reuses FreeShow's own drawer pages so behaviour stays identical.
    import type { TabsObj } from "../../../types/Tabs"
    import { activeShow, showsCache } from "../../stores"
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
            <Audio active="all" />
        {:else if $proToolsTab === "props"}
            <Overlays active="all" />
        {:else if $proToolsTab === "timers"}
            <Timers searchValue="" />
        {:else if $proToolsTab === "macros"}
            <Actions searchValue="" />
        {/if}
    </div>
</div>

<style>
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
