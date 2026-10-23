<script lang="ts">
    // ProPresenter layout: the bin has no tab row. It is a Media Bin with a breadcrumb,
    // and other content (e.g. Themes) opened from the toolbar shows a way back to Media.
    import { activeDrawerTab, dictionary, drawerTabsData, mediaFolders, templateCategories } from "../../stores"
    import { translateText } from "../../utils/language"
    import { drawerTabs } from "../../values/tabs"
    import Icon from "../helpers/Icon.svelte"

    $: tab = drawerTabs[$activeDrawerTab] || drawerTabs.media
    $: subTab = $drawerTabsData[$activeDrawerTab]?.activeSubTab || "all"
    $: categories = $activeDrawerTab === "media" ? $mediaFolders : $activeDrawerTab === "templates" ? $templateCategories : {}
    $: subName = subTab === "all" ? translateText("category.all", $dictionary) : translateText(categories[subTab]?.name || "", $dictionary) || categories[subTab]?.name || ""

    function backToMedia() {
        activeDrawerTab.set("media")
    }
</script>

<div class="binHeader">
    {#if $activeDrawerTab !== "media"}
        <button class="back" data-title={translateText("pro_layout.back_to_media", $dictionary)} on:mousedown|stopPropagation on:click|stopPropagation={backToMedia}>
            <Icon id="back" size={0.9} white />
        </button>
    {/if}

    <Icon id={tab.icon} size={0.95} white />
    <span class="crumb">{translateText(tab.name, $dictionary)}</span>
    {#if subName}
        <span class="separator">›</span>
        <span class="crumb sub">{subName}</span>
    {/if}
</div>

<style>
    .binHeader {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        height: 100%;
        min-height: 32px;
        font-size: 0.9em;
        overflow: hidden;
        white-space: nowrap;
    }

    .crumb {
        opacity: 0.85;
    }
    .crumb.sub {
        opacity: 1;
        font-weight: 600;
    }
    .separator {
        opacity: 0.5;
    }

    .back {
        display: flex;
        align-items: center;
        background: none;
        border: none;
        padding: 4px;
        border-radius: 4px;
        cursor: pointer;
    }
    .back:hover {
        background-color: var(--hover);
    }
</style>
