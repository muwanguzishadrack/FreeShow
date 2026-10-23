<script lang="ts">
    // ProPresenter layout: the Bible view takes over the centre area.
    // It reuses FreeShow's scripture pieces: translation list, Scripture page and verse options.
    import { dictionary, drawerTabsData } from "../../stores"
    import { translateText } from "../../utils/language"
    import { showSlides } from "../../utils/proActions"
    import Info from "../drawer/info/Info.svelte"
    import Navigation from "../drawer/Navigation.svelte"
    import Scripture from "../drawer/bible/Scripture.svelte"
    import Icon from "../helpers/Icon.svelte"

    let searchValue = ""
    $: active = $drawerTabsData.scripture?.activeSubTab || null
</script>

<div class="bible">
    <div class="header">
        <Icon id="scripture" size={1} white />
        <span class="title">{translateText("pro_layout.bible", $dictionary)}</span>

        <div class="search">
            <Icon id="search" size={0.85} white />
            <input type="text" placeholder={translateText("pro_layout.bible_search", $dictionary)} bind:value={searchValue} />
        </div>

        <button class="close" data-title={translateText("pro_layout.back_to_slides", $dictionary)} on:click={showSlides}>
            <Icon id="close" size={1} white />
        </button>
    </div>

    <div class="content">
        <div class="translations">
            <Navigation id="scripture" />
        </div>
        <div class="verses">
            <Scripture {active} bind:searchValue />
        </div>
        <div class="info">
            <Info id="scripture" />
        </div>
    </div>
</div>

<style>
    .bible {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 12px;
        min-height: 40px;
        background-color: var(--primary-darkest);
    }
    .title {
        font-weight: 600;
    }

    .search {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 6px;
        max-width: 420px;
        margin-inline-start: auto;
        padding: 4px 10px;
        border-radius: 12px;
        background-color: var(--primary-darker);
    }
    .search input {
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
        min-height: 0;
    }
    .translations {
        width: 220px;
        overflow-y: auto;
        border-inline-end: 1px solid var(--primary-lighter);
    }
    .verses {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        overflow: hidden;
    }
    .info {
        width: 280px;
        overflow-y: auto;
        border-inline-start: 1px solid var(--primary-lighter);
    }
</style>
