<script lang="ts">
    import type { SmartPlaylist, SmartRule, SmartRuleField } from "../../../../types/Projects"
    import { activeProject, categories, dictionary, globalTags, projects, shows } from "../../../stores"
    import { translateText } from "../../../utils/language"
    import { evaluateSmartPlaylist, getDefaultSmartPlaylist, getDefaultSmartRule, SMART_RULE_OPERATORS } from "../../../utils/smartPlaylists"
    import InputRow from "../../input/InputRow.svelte"
    import MaterialButton from "../../inputs/MaterialButton.svelte"
    import MaterialDropdown from "../../inputs/MaterialDropdown.svelte"
    import MaterialNumberInput from "../../inputs/MaterialNumberInput.svelte"
    import MaterialTextInput from "../../inputs/MaterialTextInput.svelte"
    import MaterialToggleSwitch from "../../inputs/MaterialToggleSwitch.svelte"

    const projectId = $activeProject || ""
    $: project = $projects[projectId]
    $: smart = project?.smart || getDefaultSmartPlaylist()

    $: fieldOptions = (["name", "category", "tag", "created", "modified", "used"] as SmartRuleField[]).map((value) => ({ value, label: translateText(`smart_playlist.field_${value}`, $dictionary) }))
    $: categoryOptions = Object.entries($categories).map(([value, a]) => ({ value, label: translateText(a.name, $dictionary) || a.name }))
    $: tagOptions = Object.entries($globalTags).map(([value, a]) => ({ value, label: a.name }))
    $: sortOptions = ["name", "created", "modified", "used"].map((value) => ({ value, label: translateText(`smart_playlist.field_${value}`, $dictionary) }))
    $: matchOptions = ["all", "any"].map((value) => ({ value, label: translateText(`smart_playlist.match_${value}`, $dictionary) }))

    $: matchCount = evaluateSmartPlaylist(smart, $shows).length

    function operatorOptions(field: SmartRuleField) {
        return SMART_RULE_OPERATORS[field].map((value) => ({ value, label: translateText(`smart_playlist.op_${value}`, $dictionary) }))
    }

    function update(newSmart: SmartPlaylist) {
        projects.update((a) => {
            if (!a[projectId]) return a
            a[projectId].smart = newSmart
            a[projectId].modified = Date.now()
            return a
        })
    }

    function setValue<K extends keyof SmartPlaylist>(key: K, value: SmartPlaylist[K]) {
        update({ ...smart, [key]: value })
    }

    function setRule(index: number, rule: SmartRule) {
        const rules = [...smart.rules]
        rules[index] = rule
        update({ ...smart, rules })
    }

    function changeField(index: number, field: SmartRuleField) {
        setRule(index, getDefaultSmartRule(field))
    }

    function addRule() {
        update({ ...smart, rules: [...smart.rules, getDefaultSmartRule("name")] })
    }

    function removeRule(index: number) {
        update({ ...smart, rules: smart.rules.filter((_, i) => i !== index) })
    }

    function convertToNormal() {
        projects.update((a) => {
            if (!a[projectId]) return a
            delete a[projectId].smart
            a[projectId].modified = Date.now()
            return a
        })
    }
</script>

{#if project}
    <MaterialDropdown label="smart_playlist.match" options={matchOptions} value={smart.match} on:change={(e) => setValue("match", e.detail)} />

    <div class="rules">
        {#each smart.rules as rule, index}
            <InputRow>
                <MaterialDropdown label="smart_playlist.field" options={fieldOptions} value={rule.field} on:change={(e) => changeField(index, e.detail)} />
                <MaterialDropdown label="smart_playlist.operator" options={operatorOptions(rule.field)} value={rule.operator} on:change={(e) => setRule(index, { ...rule, operator: e.detail })} />

                {#if rule.operator === "never"}
                    <!-- no value needed -->
                {:else if rule.field === "category"}
                    <MaterialDropdown label="smart_playlist.value" options={categoryOptions} value={String(rule.value)} on:change={(e) => setRule(index, { ...rule, value: e.detail })} />
                {:else if rule.field === "tag"}
                    <MaterialDropdown label="smart_playlist.value" options={tagOptions} value={String(rule.value)} on:change={(e) => setRule(index, { ...rule, value: e.detail })} />
                {:else if rule.field === "name"}
                    <MaterialTextInput label="smart_playlist.value" value={String(rule.value)} on:change={(e) => setRule(index, { ...rule, value: e.detail })} />
                {:else}
                    <MaterialNumberInput label="smart_playlist.days" value={Number(rule.value) || 0} min={0} on:change={(e) => setRule(index, { ...rule, value: e.detail })} />
                {/if}

                <MaterialButton icon="delete" title="actions.delete" on:click={() => removeRule(index)} />
            </InputRow>
        {/each}
    </div>

    <MaterialButton variant="outlined" icon="add" style="width: 100%;" on:click={addRule}>
        {translateText("smart_playlist.add_rule", $dictionary)}
    </MaterialButton>

    <InputRow style="margin-top: 20px;">
        <MaterialDropdown label="sort.sort_by" options={sortOptions} value={smart.sortBy} on:change={(e) => setValue("sortBy", e.detail)} />
        <MaterialToggleSwitch label="smart_playlist.descending" checked={!!smart.sortDescending} on:change={(e) => setValue("sortDescending", e.detail)} />
    </InputRow>
    <MaterialNumberInput label="smart_playlist.limit" value={smart.limit || 0} min={0} hideWhenZero on:change={(e) => setValue("limit", e.detail)} />

    <p class="count">{translateText("smart_playlist.matches", $dictionary)}: <b>{matchCount}</b></p>

    <MaterialButton variant="outlined" icon="project" style="width: 100%;margin-top: 10px;" on:click={convertToNormal}>
        {translateText("smart_playlist.convert_to_normal", $dictionary)}
    </MaterialButton>
{/if}

<style>
    .rules {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin: 10px 0;
    }

    .count {
        margin-top: 15px;
        opacity: 0.8;
    }
</style>
