// Smart playlists: projects whose shows are generated from rules instead of added by hand.
// Pure functions only (no stores), so they can be unit tested.

import type { ProjectShowRef, SmartPlaylist, SmartRule, SmartRuleField, SmartRuleOperator } from "../../types/Projects"
import type { TrimmedShow, TrimmedShows } from "../../types/Show"

const DAY = 24 * 60 * 60 * 1000

export const SMART_RULE_OPERATORS: { [key in SmartRuleField]: SmartRuleOperator[] } = {
    name: ["contains", "not_contains", "is", "is_not"],
    category: ["is", "is_not"],
    tag: ["is", "is_not"],
    created: ["within_days", "older_than_days"],
    modified: ["within_days", "older_than_days"],
    used: ["within_days", "older_than_days", "never"]
}

export function getDefaultSmartPlaylist(): SmartPlaylist {
    return { match: "all", rules: [{ field: "used", operator: "within_days", value: 30 }], sortBy: "name" }
}

export function getDefaultSmartRule(field: SmartRuleField): SmartRule {
    const operator = SMART_RULE_OPERATORS[field][0]
    return { field, operator, value: isDateField(field) ? 30 : "" }
}

function isDateField(field: SmartRuleField) {
    return field === "created" || field === "modified" || field === "used"
}

function getTimestamp(show: TrimmedShow, field: "created" | "modified" | "used"): number | null {
    return show.timestamps?.[field] || null
}

export function matchesRule(show: TrimmedShow, rule: SmartRule, now: number): boolean {
    const { field, operator, value } = rule

    if (field === "name") {
        const name = (show.name || "").toLowerCase()
        const search = String(value ?? "").toLowerCase()
        if (operator === "contains") return name.includes(search)
        if (operator === "not_contains") return !name.includes(search)
        if (operator === "is") return name === search
        if (operator === "is_not") return name !== search
        return false
    }

    if (field === "category") {
        const isMatch = (show.category || "") === String(value ?? "")
        return operator === "is_not" ? !isMatch : isMatch
    }

    if (field === "tag") {
        const tags: string[] = show.quickAccess?.tags || []
        const hasTag = tags.includes(String(value ?? ""))
        return operator === "is_not" ? !hasTag : hasTag
    }

    if (isDateField(field)) {
        const time = getTimestamp(show, field)
        if (operator === "never") return !time
        if (!time) return false

        const days = Number(value)
        if (!Number.isFinite(days) || days < 0) return false
        const age = now - time
        if (operator === "within_days") return age <= days * DAY
        if (operator === "older_than_days") return age > days * DAY
    }

    return false
}

// returns matching show ids, sorted and limited
export function evaluateSmartPlaylist(smart: SmartPlaylist, shows: TrimmedShows, now: number = Date.now()): string[] {
    const rules = smart.rules || []
    // no rules = no shows (prevents accidentally listing the whole library)
    if (!rules.length) return []

    let ids = Object.keys(shows).filter((id) => {
        const show = shows[id]
        if (!show || show.private) return false
        const results = rules.map((rule) => matchesRule(show, rule, now))
        return smart.match === "any" ? results.some(Boolean) : results.every(Boolean)
    })

    ids = sortShowIds(ids, shows, smart.sortBy, !!smart.sortDescending)

    const limit = Number(smart.limit) || 0
    if (limit > 0) ids = ids.slice(0, limit)

    return ids
}

function sortShowIds(ids: string[], shows: TrimmedShows, sortBy: SmartPlaylist["sortBy"], descending: boolean) {
    const sorted = [...ids].sort((a, b) => {
        if (sortBy === "name") return (shows[a].name || "").localeCompare(shows[b].name || "", undefined, { numeric: true })
        // shows without a timestamp go last
        const timeA = getTimestamp(shows[a], sortBy) ?? -Infinity
        const timeB = getTimestamp(shows[b], sortBy) ?? -Infinity
        return timeA - timeB
    })
    return descending ? sorted.reverse() : sorted
}

function isShowItem(item: ProjectShowRef) {
    return !item.type || item.type === "show"
}

// Build the new project item list: matched shows first (keeping per-item settings such as layout),
// followed by any non-show items (media, sections...) the user added manually.
// Returns null when nothing changed, so callers can skip store updates.
export function getSmartProjectShows(currentItems: ProjectShowRef[], smart: SmartPlaylist, shows: TrimmedShows, now: number = Date.now()): ProjectShowRef[] | null {
    const matchedIds = evaluateSmartPlaylist(smart, shows, now)

    const existingShowItems = new Map<string, ProjectShowRef>()
    currentItems.filter(isShowItem).forEach((item) => {
        if (!existingShowItems.has(item.id)) existingShowItems.set(item.id, item)
    })
    const otherItems = currentItems.filter((item) => !isShowItem(item))

    const showItems: ProjectShowRef[] = matchedIds.map((id) => existingShowItems.get(id) || { id, type: "show" })
    const newItems = [...showItems, ...otherItems]

    const unchanged = newItems.length === currentItems.length && newItems.every((item, i) => item === currentItems[i])
    return unchanged ? null : newItems
}
