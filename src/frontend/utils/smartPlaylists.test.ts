import { describe, expect, it } from "vitest"
import type { ProjectShowRef, SmartPlaylist } from "../../types/Projects"
import type { TrimmedShows } from "../../types/Show"
import { evaluateSmartPlaylist, getSmartProjectShows, matchesRule } from "./smartPlaylists"

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.UTC(2026, 9, 23)

const shows: TrimmedShows = {
    amazing: { name: "Amazing Grace", category: "song", timestamps: { created: NOW - 400 * DAY, modified: NOW - 10 * DAY, used: NOW - 3 * DAY }, quickAccess: { tags: ["easter", "hymn"] } },
    howGreat: { name: "How Great Thou Art", category: "song", timestamps: { created: NOW - 200 * DAY, modified: null, used: NOW - 60 * DAY }, quickAccess: { tags: ["hymn"] } },
    newSong: { name: "New Song", category: "song", timestamps: { created: NOW - 2 * DAY, modified: null, used: null } },
    announcements: { name: "Announcements", category: "presentation", timestamps: { created: NOW - 30 * DAY, modified: NOW - 1 * DAY, used: NOW - 1 * DAY } },
    secret: { name: "Private Song", category: "song", private: true, timestamps: { created: NOW, modified: null, used: NOW } }
}

function smart(partial: Partial<SmartPlaylist>): SmartPlaylist {
    return { match: "all", rules: [], sortBy: "name", ...partial }
}

describe("matchesRule", () => {
    it("matches name text case-insensitively", () => {
        expect(matchesRule(shows.amazing, { field: "name", operator: "contains", value: "grace" }, NOW)).toBe(true)
        expect(matchesRule(shows.amazing, { field: "name", operator: "not_contains", value: "grace" }, NOW)).toBe(false)
        expect(matchesRule(shows.amazing, { field: "name", operator: "is", value: "amazing grace" }, NOW)).toBe(true)
    })

    it("matches category and tags", () => {
        expect(matchesRule(shows.announcements, { field: "category", operator: "is", value: "presentation" }, NOW)).toBe(true)
        expect(matchesRule(shows.announcements, { field: "category", operator: "is_not", value: "song" }, NOW)).toBe(true)
        expect(matchesRule(shows.amazing, { field: "tag", operator: "is", value: "easter" }, NOW)).toBe(true)
        expect(matchesRule(shows.newSong, { field: "tag", operator: "is", value: "easter" }, NOW)).toBe(false)
        expect(matchesRule(shows.newSong, { field: "tag", operator: "is_not", value: "easter" }, NOW)).toBe(true)
    })

    it("matches date windows", () => {
        expect(matchesRule(shows.amazing, { field: "used", operator: "within_days", value: 7 }, NOW)).toBe(true)
        expect(matchesRule(shows.howGreat, { field: "used", operator: "within_days", value: 7 }, NOW)).toBe(false)
        expect(matchesRule(shows.howGreat, { field: "used", operator: "older_than_days", value: 30 }, NOW)).toBe(true)
        expect(matchesRule(shows.newSong, { field: "used", operator: "never", value: "" }, NOW)).toBe(true)
        // never-used shows don't match a date window
        expect(matchesRule(shows.newSong, { field: "used", operator: "older_than_days", value: 30 }, NOW)).toBe(false)
    })
})

describe("evaluateSmartPlaylist", () => {
    it("returns nothing when there are no rules", () => {
        expect(evaluateSmartPlaylist(smart({ rules: [] }), shows, NOW)).toEqual([])
    })

    it("combines rules with all/any and excludes private shows", () => {
        const rules = [
            { field: "category" as const, operator: "is" as const, value: "song" },
            { field: "tag" as const, operator: "is" as const, value: "hymn" }
        ]
        expect(evaluateSmartPlaylist(smart({ match: "all", rules }), shows, NOW)).toEqual(["amazing", "howGreat"])
        expect(evaluateSmartPlaylist(smart({ match: "any", rules }), shows, NOW)).toEqual(["amazing", "howGreat", "newSong"])
    })

    it("sorts by date descending and applies a limit", () => {
        const playlist = smart({ rules: [{ field: "used", operator: "within_days", value: 90 }], sortBy: "used", sortDescending: true, limit: 2 })
        expect(evaluateSmartPlaylist(playlist, shows, NOW)).toEqual(["announcements", "amazing"])
    })
})

describe("getSmartProjectShows", () => {
    const songs = smart({ rules: [{ field: "tag", operator: "is", value: "hymn" }] })

    it("keeps per-item settings and manually added media", () => {
        const media: ProjectShowRef = { id: "C:/video.mp4", type: "video" }
        const existing: ProjectShowRef = { id: "howGreat", layout: "short" }
        const result = getSmartProjectShows([media, existing], songs, shows, NOW)
        expect(result).toEqual([{ id: "amazing", type: "show" }, existing, media])
        expect(result?.[1]).toBe(existing)
    })

    it("removes shows that no longer match", () => {
        const result = getSmartProjectShows([{ id: "newSong" }, { id: "amazing" }], songs, shows, NOW)
        expect(result?.map((a) => a.id)).toEqual(["amazing", "howGreat"])
    })

    it("returns null when nothing changed", () => {
        const items: ProjectShowRef[] = [{ id: "amazing" }, { id: "howGreat" }]
        expect(getSmartProjectShows(items, songs, shows, NOW)).toBeNull()
    })
})
